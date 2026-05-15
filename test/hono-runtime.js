var assert = require('assert');
var fs = require('fs');
var path = require('path');
var testHelpers = require('./hono-test-helpers');

describe('hono runtime', function() {
  var app;
  var sessions;

  beforeEach(function() {
    sessions = new Map();
    resetAppModules();
    installStubs();
    app = require('../app');
  });

  afterEach(function() {
    resetAppModules();
    cleanupUploads();
  });

  it('renders login for anonymous protected manager pages', async function() {
    var response = await app.fetch(new Request('http://localhost/manager/expense'));
    var body = await response.text();

    assert.equal(response.status, 200);
    assert(body.includes('Spark Property Manager'));
    assert(body.includes('Login'));
  });

  it('preserves login failure flash messages', async function() {
    var login = await app.fetch(new Request('http://localhost/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=bad@example.com&password=wrong',
      redirect: 'manual'
    }));
    var cookie = login.headers.get('set-cookie');

    assert.equal(login.status, 302);
    assert.equal(login.headers.get('location'), '/login');
    assert(cookie);

    var home = await app.fetch(new Request('http://localhost/', {
      headers: { cookie: cookie }
    }));
    var body = await home.text();

    assert.equal(home.status, 200);
    assert(body.includes('Login Failure'));
  });

  it('stores successful login sessions and renders CSRF tokens', async function() {
    var login = await loginRequest();
    var cookie = login.headers.get('set-cookie');
    var record = firstSessionRecord();
    var session = JSON.parse(record.data);

    assert.equal(login.status, 301);
    assert.equal(login.headers.get('location'), '/');
    assert(cookie);
    assert(record.sid);
    assert.equal(record.userId, 1);
    assert(record.expires instanceof Date);
    assert(record.createdAt instanceof Date);
    assert(record.updatedAt instanceof Date);
    assert.equal(session.userId, 1);
    assert.equal(session.passport.user, 1);
    assert(session.cookie.expires);
    assert(session.cookie.maxAge > 0);

    var manager = await app.fetch(new Request('http://localhost/manager/expense', {
      headers: { cookie: cookie }
    }));
    var body = await manager.text();

    assert.equal(manager.status, 200);
    assert(body.includes('meta name="csrf-token"'));
    assert(body.includes('Expense'));
  });

  it('preserves createdAt while updating existing database sessions', async function() {
    var login = await loginRequest();
    var firstRecord = firstSessionRecord();
    var createdAt = firstRecord.createdAt;

    await app.fetch(new Request('http://localhost/manager/expense', {
      headers: { cookie: login.headers.get('set-cookie') }
    }));

    var secondRecord = firstSessionRecord();
    assert.equal(secondRecord.sid, firstRecord.sid);
    assert.strictEqual(secondRecord.createdAt, createdAt);
    assert(secondRecord.updatedAt instanceof Date);
  });

  it('serves authenticated JSON routes with existing response shape', async function() {
    var login = await loginRequest();
    var result = await testHelpers.fetchJson(app, 'http://localhost/properties', {
      headers: { cookie: login.headers.get('set-cookie') }
    });

    assert.equal(result.response.status, 200);
    assert(Array.isArray(result.body.data));
    assert.equal(result.body.data[0].id, 10);
  });

  it('serves native payment routes and awaits write side effects', async function() {
    var login = await loginRequest();
    var cookie = login.headers.get('set-cookie');
    var token = await csrfToken(cookie);

    var created = await testHelpers.fetchJson(app, 'http://localhost/payments/methods', {
      method: 'POST',
      headers: {
        cookie: cookie,
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrf-token': token
      },
      body: 'type_id=2&description=Checking&account_number=1234'
    });

    assert.equal(created.response.status, 200);
    assert.equal(created.body.description, 'Checking');
    assert.equal(created.body.company_id, 7);

    var list = await testHelpers.fetchJson(app, 'http://localhost/payments/methods', {
      headers: { cookie: cookie }
    });

    assert.equal(list.response.status, 200);
    assert.equal(list.body.data.length, 1);
    assert.equal(list.body.data[0].account_number, '1234');
  });

  it('serves public static assets and protects uploads', async function() {
    var publicResponse = await app.fetch(new Request('http://localhost/stylesheets/style.css'));
    var publicBody = await publicResponse.text();

    assert.equal(publicResponse.status, 200);
    assert(publicBody.includes('body'));

    var uploadResponse = await app.fetch(new Request('http://localhost/uploads/test.txt'));
    var uploadBody = await uploadResponse.text();

    assert.equal(uploadResponse.status, 200);
    assert(uploadBody.includes('Spark Property Manager'));
  });

  it('returns missing-file errors for receipt and statement uploads with CSRF', async function() {
    var login = await loginRequest();
    var cookie = login.headers.get('set-cookie');
    var token = await csrfToken(cookie);

    var receipt = await app.fetch(new Request('http://localhost/file/receipt', {
      method: 'POST',
      headers: {
        cookie: cookie,
        'x-csrf-token': token
      }
    }));

    assert.equal(receipt.status, 400);
    assert.equal(await receipt.text(), 'No files were uploaded.');

    var statement = await app.fetch(new Request('http://localhost/file/statement/1', {
      method: 'POST',
      headers: {
        cookie: cookie,
        'x-csrf-token': token
      }
    }));

    assert.equal(statement.status, 400);
    assert.equal(await statement.text(), 'No files were uploaded.');
  });

  it('renders not found pages', async function() {
    var response = await app.fetch(new Request('http://localhost/no-such-route'));
    var body = await response.text();

    assert.equal(response.status, 404);
    assert(body.includes('Not Found'));
  });

  it('rejects expired database sessions', async function() {
    var login = await loginRequest();
    var record = firstSessionRecord();
    record.expires = new Date(Date.now() - 1000);

    var response = await app.fetch(new Request('http://localhost/manager/expense', {
      headers: { cookie: login.headers.get('set-cookie') }
    }));
    var body = await response.text();

    assert.equal(response.status, 200);
    assert(body.includes('Spark Property Manager'));
    assert(body.includes('Login'));
  });

  it('destroys database sessions and clears cookies on logout', async function() {
    var login = await loginRequest();
    var cookie = login.headers.get('set-cookie');
    var sid = firstSessionRecord().sid;

    var logout = await app.fetch(new Request('http://localhost/logout', {
      headers: { cookie: cookie },
      redirect: 'manual'
    }));

    assert.equal(logout.status, 302);
    assert.equal(logout.headers.get('location'), '/');
    assert.equal(sessions.has(sid), false);
    assert((logout.headers.get('set-cookie') || '').includes('connect.sid='));

    var manager = await app.fetch(new Request('http://localhost/manager/expense', {
      headers: { cookie: cookie }
    }));
    var body = await manager.text();

    assert.equal(manager.status, 200);
    assert(body.includes('Spark Property Manager'));
    assert(body.includes('Login'));
  });

  async function loginRequest() {
    return await app.fetch(new Request('http://localhost/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: 'username=user@example.com&password=secret',
      redirect: 'manual'
    }));
  }

  async function csrfToken(cookie) {
    var response = await app.fetch(new Request('http://localhost/manager/expense', {
      headers: { cookie: cookie }
    }));
    var body = await response.text();
    var match = body.match(/meta name="csrf-token" content=([^>]+)>/);
    assert(match);
    return match[1];
  }

  function firstSessionRecord() {
    var values = Array.from(sessions.values());
    assert(values.length > 0);
    return values[0];
  }

  function installStubs() {
    var users = {
      1: {
        id: 1,
        company_id: 7,
        email: 'user@example.com',
        firstname: 'Test',
        phone: '555-0100',
        is_admin: false,
        is_manager: true
      }
    };

    setModule('../config', {
      get: function(key) {
        var values = {
          'app.https': false,
          'app.hostname': 'localhost',
          'app.port': 8080,
          'app.sessionSecret': 'test-secret',
          'app.url': 'http://localhost:8080',
          'smtp.username': 'smtp@example.com'
        };
        return values[key];
      }
    });

    setModule('../log', {
      debug: function() {},
      error: function() {},
      info: function() {}
    });

    setModule('../email', {
      send: function(message, cb) {
        cb(null, message);
      }
    });

    setModule('../models', {
      Sessions: {
        findByPk: async function(sid) {
          return sessions.get(sid) || null;
        },
        upsert: async function(record) {
          var existing = sessions.get(record.sid);
          sessions.set(record.sid, Object.assign({}, existing || {}, record));
        },
        destroy: async function(options) {
          sessions.delete(options.where.sid);
        }
      },
      User: {
        findByPk: async function(id) {
          return users[id] || null;
        }
      },
      Property: {
        findAll: async function() {
          return [{ id: 10, company_id: 7, address_street: '1 Main St' }];
        }
      },
      PropertyType: {},
      PropertyUnit: {},
      PaymentType: {},
      PaymentMethod: createPaymentMethodStore(),
      sequelize: {
        QueryTypes: {
          INSERT: 'INSERT',
          SELECT: 'SELECT',
          UPDATE: 'UPDATE'
        },
        query: async function(sql, options) {
          if (
            sql.includes('FROM login_user')
            && options.bind[0] === 'user@example.com'
            && options.bind[1] === 'secret'
          ) {
            return [users[1]];
          }
          return [];
        },
        transaction: function(callback) {
          return callback({});
        }
      }
    });
  }

  function createPaymentMethodStore() {
    var methods = [];
    var nextId = 1;

    return {
      findAll: async function() {
        return methods;
      },
      findByPk: async function(id) {
        return methods.find(function(method) {
          return String(method.id) === String(id);
        }) || null;
      },
      create: async function(values) {
        var method = Object.assign({ id: nextId++ }, values);
        method.update = async function(updated) {
          Object.assign(method, updated);
          return method;
        };
        methods.push(method);
        return method;
      },
      destroy: async function(options) {
        methods = methods.filter(function(method) {
          return String(method.id) !== String(options.where.id);
        });
      }
    };
  }

  function setModule(relativePath, exports) {
    var resolved = require.resolve(relativePath);
    require.cache[resolved] = {
      id: resolved,
      filename: resolved,
      loaded: true,
      exports: exports
    };
  }

  function resetAppModules() {
    Object.keys(require.cache).forEach(function(key) {
      if (
        key.includes('/app.js')
        || key.includes('/lib/hono-compat.js')
        || key.includes('/routes/')
        || key.includes('/models/index.js')
        || key.includes('/config/index.js')
        || key.includes('/log/index.js')
        || key.includes('/email/index.js')
      ) {
        delete require.cache[key];
      }
    });
  }

  function cleanupUploads() {
    var uploadDir = path.join(__dirname, '..', 'uploads');
    fs.readdirSync(uploadDir)
      .filter(function(file) {
        return file.indexOf('7-receipt-') === 0 || file.indexOf('7-statement-') === 0;
      })
      .forEach(function(file) {
        fs.unlinkSync(path.join(uploadDir, file));
      });
  }
});
