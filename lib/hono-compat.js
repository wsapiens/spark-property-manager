const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { getCookie, setCookie, deleteCookie } = require('hono/cookie');
const ejs = require('ejs');
const config = require('../config');
const log = require('../log');
const models = require('../models');

const SESSION_COOKIE = 'connect.sid';
const SESSION_DURATION = 60 * 60 * 1000;
const ROOT = path.join(__dirname, '..');
const VIEWS = path.join(ROOT, 'views');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

async function render(c, view, locals, status, headers) {
  const data = Object.assign({}, locals || {});
  data.message = data.message || '';
  data.error = data.error || {};
  const html = await ejs.renderFile(path.join(VIEWS, `${view}.ejs`), data);
  return c.html(html, status || 200, headers || {});
}

async function parseBody(c) {
  if (c.get('parsedBody')) {
    return c.get('parsedBody');
  }

  const method = c.req.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return {};
  }

  const type = c.req.header('content-type') || '';
  try {
    if (type.includes('application/json')) {
      const body = await c.req.json();
      c.set('parsedBody', body || {});
      return body || {};
    }
    if (type.includes('multipart/form-data') || type.includes('application/x-www-form-urlencoded')) {
      const body = await c.req.parseBody();
      c.set('parsedBody', body || {});
      return body || {};
    }
  } catch (error) {
    log.error(error.message);
  }

  c.set('parsedBody', {});
  return {};
}

function getRequestIp(c) {
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';
}

function getSessionCookieOptions() {
  const expires = new Date(Date.now() + SESSION_DURATION);
  return {
    secure: config.get('app.https') === true || config.get('app.https') === 'true',
    httpOnly: true,
    domain: findDomain(),
    expires,
    path: '/'
  };
}

function findDomain() {
  if (config.get('app.url')) {
    return config.get('app.url').split('://')[1].split(':')[0];
  }
  if (config.get('app.hostname')) {
    return config.get('app.hostname');
  }
  return 'localhost';
}

function sign(value) {
  return crypto
    .createHmac('sha256', String(config.get('app.sessionSecret') || 'secret'))
    .update(value)
    .digest('base64')
    .replace(/=+$/, '');
}

function encodeSessionId(sid) {
  return `s:${sid}.${sign(sid)}`;
}

function decodeSessionId(value) {
  if (!value) {
    return null;
  }

  const decoded = decodeURIComponent(value);
  if (!decoded.startsWith('s:')) {
    return decoded;
  }

  const unsigned = decoded.slice(2);
  const dot = unsigned.lastIndexOf('.');
  if (dot === -1) {
    return null;
  }

  const sid = unsigned.slice(0, dot);
  const signature = unsigned.slice(dot + 1);
  return signature === sign(sid) ? sid : null;
}

function createSession() {
  const session = {
    cookie: {
      expires: new Date(Date.now() + SESSION_DURATION),
      maxAge: SESSION_DURATION
    },
    flash: {}
  };
  attachSessionDestroy(session);
  return session;
}

async function loadSession(sid) {
  if (!sid) {
    return createSession();
  }

  const record = await models.Sessions.findByPk(sid);
  if (!record || (record.expires && record.expires < new Date())) {
    return createSession();
  }

  try {
    const session = Object.assign(createSession(), JSON.parse(record.data || '{}'));
    attachSessionDestroy(session);
    return session;
  } catch (error) {
    log.error(error.message);
    return createSession();
  }
}

function attachSessionDestroy(session) {
  Object.defineProperty(session, 'destroy', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function() {}
  });
}

function sessionMiddleware() {
  return async (c, next) => {
    let sid = decodeSessionId(getCookie(c, SESSION_COOKIE));
    if (!sid) {
      sid = crypto.randomBytes(24).toString('hex');
    }

    const session = await loadSession(sid);
    const sessionRecord = await models.Sessions.findByPk(sid);
    c.set('sessionId', sid);
    c.set('session', session);
    c.set('sessionRecord', sessionRecord);
    await loadUser(c);

    try {
      await next();
    } finally {
      if (c.get('sessionDestroyPromise')) {
        await c.get('sessionDestroyPromise');
      }
      if (c.get('sessionDestroyed')) {
        clearSessionCookie(c);
      } else {
        await saveSession(c);
      }
    }
  };
}

async function saveSession(c) {
  const sid = c.get('sessionId');
  const session = c.get('session') || createSession();
  const cookieOptions = getSessionCookieOptions();
  const now = new Date();
  const record = c.get('sessionRecord');
  const expires = session.cookie && session.cookie.expires
    ? new Date(session.cookie.expires)
    : cookieOptions.expires;

  session.cookie = Object.assign({}, session.cookie || {}, {
    expires,
    maxAge: session.cookie && session.cookie.maxAge ? session.cookie.maxAge : SESSION_DURATION
  });

  await models.Sessions.upsert({
    sid,
    userId: session.userId || (session.passport && session.passport.user) || null,
    expires,
    data: JSON.stringify(session),
    createdAt: record && record.createdAt ? record.createdAt : now,
    updatedAt: now
  });

  setCookie(c, SESSION_COOKIE, encodeSessionId(sid), Object.assign(cookieOptions, { expires }));
}

function clearSessionCookie(c) {
  const options = getSessionCookieOptions();
  deleteCookie(c, SESSION_COOKIE, {
    path: options.path,
    domain: options.domain
  });
}

async function loadUser(c) {
  const session = c.get('session') || {};
  const userId = session.userId || (session.passport && session.passport.user);
  if (!userId) {
    c.set('user', null);
    return;
  }

  const user = await models.User.findByPk(userId);
  c.set('user', user);
}

function requireLogin() {
  return async (c, next) => {
    if (c.get('user')) {
      await next();
      return;
    }
    const response = await render(c, 'login', { message: '' });
    return response;
  };
}

function csrfToken(c) {
  const session = c.get('session') || {};
  if (!session.csrfToken) {
    session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return session.csrfToken;
}

function csrfMiddleware() {
  return async (c, next) => {
    csrfToken(c);
    const method = c.req.method.toUpperCase();
    const pathname = new URL(c.req.url).pathname;
    const ignored = pathname === '/'
      || pathname === '/login'
      || pathname.startsWith('/login')
      || pathname === '/subscribe'
      || pathname.startsWith('/subscribe');
    if (ignored || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      await next();
      return;
    }

    const body = await parseBody(c);
    const submitted = body._csrf || c.req.header('x-csrf-token') || c.req.header('csrf-token');
    if (submitted && submitted === c.get('session').csrfToken) {
      await next();
      return;
    }

    return c.text('invalid csrf token', 403);
  };
}

function logger() {
  return async (c, next) => {
    const started = Date.now();
    await next();
    log.info(`${c.req.method} ${new URL(c.req.url).pathname} ${c.res.status} ${Date.now() - started}ms`);
  };
}

function ipFilter(ips) {
  ips = ips || [];
  return async (c, next) => {
    if (ips.includes(getRequestIp(c))) {
      return c.text('Forbidden', 403);
    }
    await next();
  };
}

function rateLimiter(options) {
  const windowMs = options.windowMs;
  const max = options.max;
  const hits = new Map();

  return async (c, next) => {
    const ip = getRequestIp(c);
    const now = Date.now();
    const current = hits.get(ip) || { count: 0, reset: now + windowMs };
    if (current.reset <= now) {
      current.count = 0;
      current.reset = now + windowMs;
    }
    current.count++;
    hits.set(ip, current);

    c.header('RateLimit-Limit', String(max));
    c.header('RateLimit-Remaining', String(Math.max(max - current.count, 0)));
    c.header('RateLimit-Reset', String(Math.ceil(current.reset / 1000)));

    if (current.count > max) {
      return c.text('Too Many Requests', 429);
    }
    await next();
  };
}

function staticFiles(rootDir, options) {
  options = options || {};
  const absoluteRoot = path.resolve(ROOT, rootDir);
  const prefix = options.prefix || '';

  return async (c, next) => {
    if (!['GET', 'HEAD'].includes(c.req.method.toUpperCase())) {
      await next();
      return;
    }

    let pathname = decodeURIComponent(new URL(c.req.url).pathname);
    if (prefix) {
      if (!pathname.startsWith(prefix)) {
        await next();
        return;
      }
      pathname = pathname.slice(prefix.length) || '/';
    }

    const normalized = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.resolve(absoluteRoot, `.${normalized}`);
    if (!filePath.startsWith(absoluteRoot)) {
      await next();
      return;
    }

    try {
      const stat = await fs.promises.stat(filePath);
      if (!stat.isFile()) {
        await next();
        return;
      }
      const body = c.req.method.toUpperCase() === 'HEAD' ? undefined : await fs.promises.readFile(filePath);
      return c.body(body, 200, {
        'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      });
    } catch (error) {
      await next();
    }
  };
}

function notFound() {
  return async c => {
    return await render(c, 'error', { message: 'Not Found', error: {} }, 404);
  };
}

function onError(error, c) {
  log.error(error.message);
  log.error(error.stack);
  const status = error.status || error.statusCode || 500;
  const env = process.env.NODE_ENV || 'development';
  return render(c, 'error', {
    message: error.message,
    error: env === 'development' ? error : {}
  }, status);
}

module.exports = {
  csrfMiddleware,
  csrfToken,
  ipFilter,
  logger,
  notFound,
  onError,
  rateLimiter,
  requireLogin,
  sessionMiddleware,
  staticFiles
};
