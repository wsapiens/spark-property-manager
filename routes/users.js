const { Hono } = require('hono');
const log = require('../log');
const email = require('../email');
const models = require('../models');
const config = require('../config');
const crypto = require('../util/crypto');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const users = await models.User.findAll({
    where: {
      company_id: user.company_id
    }
  });
  return c.json({ data: users });
});

router.post('/:userId/password', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const userId = c.req.param('userId');
  if (!body.new_pass) {
    return c.text('New password is required', 400);
  }

  return await models.sequelize.transaction(async t => {
    const rows = await models.sequelize.query(
      'SELECT password FROM login_user WHERE id=$1',
      {
        bind: [userId],
        type: models.sequelize.QueryTypes.SELECT,
        transaction: t
      }
    );

    if (rows.length === 0) {
      return c.text('User not found', 404);
    }

    const existingPassword = rows[0].password;
    if (existingPassword) {
      const verified = await models.sequelize.query(
        'SELECT id FROM login_user WHERE id=$1 AND password = crypt($2, password)',
        {
          bind: [userId, body.old_pass || ''],
          type: models.sequelize.QueryTypes.SELECT,
          transaction: t
        }
      );

      if (verified.length === 0) {
        return c.text('Old password does not match', 400);
      }
    }

    await models.sequelize.query(
      "UPDATE login_user SET password = crypt($2, gen_salt('bf')) WHERE id=$1",
      {
        bind: [userId, body.new_pass],
        type: models.sequelize.QueryTypes.UPDATE,
        transaction: t
      }
    );

    return c.json({ message: 'Password changed successfully.' });
  });
});

router.get('/:userId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const foundUser = await models.User.findByPk(c.req.param('userId'));
  return c.json(foundUser);
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  if (!body.email) {
    return c.text('Email is required field', 400);
  }
  const temporaryPassword = 'password';
  const message = {
    text: 'Your Account has been created with your email: ' +
      body.email +
      ' and temporary password: ' +
      temporaryPassword +
      ', please change password after login ' + config.get('app.url'),
    from: 'SPARK REM <' + config.get('smtp.username') + '>',
    to: body.firstname + ' <' + body.email + '>',
    subject: 'SPARK Property Manager App Account Creation'
  };

  await models.sequelize.query(
    'INSERT INTO login_user(email, password, firstname, lastname, phone, is_manager, company_id)' +
      " VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7)",
    {
      bind: [
        body.email,
        temporaryPassword,
        body.firstname,
        body.lastname,
        body.phone,
        body.is_manager,
        user.company_id
      ],
      type: models.sequelize.QueryTypes.INSERT
    }
  );
  email.send(message, function(err, message) { log.info(err || message); });
  return empty(c);
});

router.put('/:userId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const temporaryPassword = 'password';
  const message = {
    text: 'Your Account has been updated with your email: ' +
      body.email +
      ' and temporary password: ' +
      temporaryPassword +
      ', please change password after login ' + config.get('app.url'),
    from: 'SPARK PM <' + config.get('smtp.username') + '>',
    to: body.firstname + ' <' + body.email + '>',
    subject: 'SPARK Property Manager App Account Update'
  };

  await models.sequelize.query(
    "UPDATE login_user SET email=$1, password=crypt($2, gen_salt('bf')), firstname=$3, lastname=$4, phone=$5, is_manager=$6 WHERE id=$7",
    {
      bind: [
        body.email,
        temporaryPassword,
        body.firstname,
        body.lastname,
        body.phone,
        body.is_manager,
        c.req.param('userId')
      ],
      type: models.sequelize.QueryTypes.UPDATE
    }
  );
  log.info('send email to ' + body.email);
  email.send(message, function(err, message) { log.info(err || message); });
  return empty(c);
});

router.delete('/:userId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.User.destroy({
    where: {
      id: c.req.param('userId')
    }
  });
  return empty(c);
});

module.exports = router;
