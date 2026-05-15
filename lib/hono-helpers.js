const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const validator = require('validator');
const config = require('../config');
const log = require('../log');
const models = require('../models');

const ROOT = path.join(__dirname, '..');
const VIEWS = path.join(ROOT, 'views');

async function renderView(c, view, locals, status, headers) {
  const data = Object.assign({}, locals || {});
  data.message = data.message || '';
  data.error = data.error || {};
  const html = await ejs.renderFile(path.join(VIEWS, `${view}.ejs`), data);
  return c.html(html, status || 200, headers || {});
}

function getSession(c) {
  return c.get('session') || {};
}

function currentUser(c) {
  return c.get('user') || null;
}

function isAuthenticated(c) {
  return !!currentUser(c);
}

function requireUser(c) {
  return currentUser(c);
}

function renderLogin(c, message) {
  return renderView(c, 'login', { message: message || '' });
}

function flash(c, key, value) {
  const session = getSession(c);
  session.flash = session.flash || {};
  if (value !== undefined) {
    session.flash[key] = session.flash[key] || [];
    session.flash[key].push(value);
    return session.flash[key];
  }

  const messages = session.flash[key] || [];
  delete session.flash[key];
  return messages;
}

function csrfToken(c) {
  const session = getSession(c);
  if (!session.csrfToken) {
    session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return session.csrfToken;
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

function getQuery(c) {
  return Object.fromEntries(new URL(c.req.url).searchParams.entries());
}

function getRequestIp(c) {
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';
}

async function authenticate(username, password) {
  const users = await models.sequelize.query(
    'SELECT id, company_id, email, firstname, phone, is_admin, is_manager FROM login_user WHERE email=$1 AND password = crypt($2, password)',
    {
      bind: [username, password],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return users.length > 0 ? users[0] : null;
}

function loginUser(c, user) {
  const session = getSession(c);
  session.userId = user.id;
  session.passport = { user: user.id };
  c.set('user', user);
}

function logoutUser(c) {
  const session = getSession(c);
  delete session.passport;
  delete session.userId;
  c.set('user', null);
}

function destroySession(c) {
  const promise = (async () => {
    const sid = c.get('sessionId');
    const session = getSession(c);

    delete session.passport;
    delete session.userId;
    delete session.csrfToken;
    session.flash = {};
    c.set('user', null);
    c.set('sessionDestroyed', true);

    if (sid && models.Sessions && typeof models.Sessions.destroy === 'function') {
      await models.Sessions.destroy({ where: { sid } });
    }
  })();

  c.set('sessionDestroyPromise', promise);
  return promise;
}

async function uploadSingle(c, fieldName) {
  const body = await parseBody(c);
  const file = body[fieldName];
  const user = requireUser(c);
  if (!file || typeof file.arrayBuffer !== 'function' || !user) {
    c.set('file', undefined);
    return undefined;
  }

  const filename = validator.escape([
    user.company_id,
    fieldName,
    Date.now(),
    file.name
  ].join('-'));
  const targetPath = path.join(ROOT, 'uploads', filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(targetPath, buffer);

  const uploadedFile = {
    fieldname: fieldName,
    originalname: file.name,
    filename,
    path: targetPath,
    size: file.size,
    mimetype: file.type
  };
  c.set('file', uploadedFile);
  return uploadedFile;
}

function empty(c, status) {
  return c.body('', status || 200);
}

module.exports = {
  authenticate,
  csrfToken,
  currentUser,
  destroySession,
  empty,
  flash,
  getQuery,
  getRequestIp,
  getSession,
  isAuthenticated,
  loginUser,
  logoutUser,
  parseBody,
  renderLogin,
  renderView,
  requireUser,
  uploadSingle
};
