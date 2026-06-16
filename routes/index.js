const { Hono } = require('hono');
const log = require('../log');
const email = require('../email');
const models = require('../models');
const config = require('../config');
const pjson = require('../package.json');
const crypto = require('../util/crypto');
const {
  authenticate,
  csrfToken,
  destroySession,
  flash,
  getRequestIp,
  getSession,
  loginUser,
  logoutUser,
  parseBody,
  renderLogin,
  renderView,
  requireUser
} = require('../lib/hono-helpers');

const router = new Hono();

router.get('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c, flash(c, 'errorMessage'));
  }

  return renderView(c, 'index', {
    legacyUi: false,
    reactPage: 'dashboard',
    reactBootstrap: {
      manager: user.is_manager,
      version: pjson.version,
      csrfToken: csrfToken(c)
    }
  });
});

router.get('/login', async c => {
  const ip = getRequestIp(c);
  console.log('request-ip: ' + ip);
  log.info('login-ip: ' + ip);
  return renderLogin(c, flash(c, 'errorMessage'));
});

router.post('/login', async c => {
  const body = await parseBody(c);
  const user = await authenticate(body.username, body.password);
  if (!user) {
    flash(c, 'errorMessage', 'Login Failure');
    return c.redirect('/login');
  }

  loginUser(c, user);
  const ip = getRequestIp(c);
  console.log('request-ip: ' + ip);
  log.info('request-ip: ' + ip);
  const hour = 3600000;
  const session = getSession(c);
  session.cookie.expires = new Date(Date.now() + hour);
  session.cookie.maxAge = hour;
  return c.redirect('/', 301);
});

router.get('/password', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  return renderView(c, 'password', {
    manager: user.is_manager,
    message: '',
    csrfToken: csrfToken(c)
  });
});

router.post('/password', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  return await models.sequelize.transaction(async function(t) {
    const users = await models.sequelize.query(
      'SELECT * FROM login_user WHERE id=$1 AND password = crypt($2, password)',
      {
        bind: [
          user.id,
          body.old_pass
        ],
        type: models.sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );
    if (users.length > 0) {
      console.log('old password is verified');
      log.debug('old password is verified');
      await models.sequelize.query(
        "UPDATE login_user SET password = crypt($2, gen_salt('bf')) WHERE id=$1",
        {
          bind: [
            user.id,
            body.new_pass
          ],
          type: models.sequelize.QueryTypes.UPDATE,
          transaction: t
        }
      );
      log.info('password has been changed for user id: ' + user.id);
      return renderView(c, 'password', {
        manager: user.is_manager,
        message: '',
        csrfToken: csrfToken(c)
      });
    }
    console.log('old password verification fail for user id: ' + user.id);
    log.info('old password verification fail for user id: ' + user.id);
    return renderView(c, 'password', {
      manager: user.is_manager,
      message: 'password change failed',
      csrfToken: csrfToken(c)
    });
  });
});

router.get('/logout', async c => {
  logoutUser(c);
  await destroySession(c);
  return c.redirect('/');
});

router.get('/subscribe', c => {
  return renderView(c, 'subscribe', { message: '', error_message: '' });
});

router.post('/subscribe', async c => {
  const body = await parseBody(c);
  if (!body.email) {
    return renderView(c, 'subscribe', { message: '', error_message: 'email address is missing!' });
  }

  return await models.sequelize.transaction(async function(t) {
    const user = await models.User.find({
      where: {
        email: body.email
      },
      transaction: null
    });
    if (user) {
      return renderView(c, 'subscribe', { message: '', error_message: 'The email is already registered!' });
    }
    const company = await models.Company.create({
      name: body.email
    }, { transaction: t });
    const companyId = company.id;
    const randomPassword = crypto.generateRandomString(5);
    const message = {
      text: 'Your Account has been created with your email: ' +
        body.email +
        ' and temporary password: ' +
        randomPassword +
        ', please change password after login ' + config.get('app.url'),
      from: 'SPARK REM <' + config.get('smtp.username') + '>',
      to: ' <' + body.email + '>',
      subject: 'SPARK Property Manager APP Account Creation'
    };
    await models.sequelize.query(
      "INSERT INTO login_user (email, password, is_manager, company_id) VALUES ($1, crypt($2, gen_salt('bf')), $3, $4)",
      {
        bind: [
          body.email,
          randomPassword,
          true,
          companyId
        ],
        type: models.sequelize.QueryTypes.INSERT,
        transaction: t
      }
    );
    email.send(message, function(err, message) { log.info(err || message); });
    return renderView(c, 'subscribe', {
      message: 'Account has been created and password sent to your email',
      error_message: ''
    });
  });
});

module.exports = router;
