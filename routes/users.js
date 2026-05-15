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
  const randomPassword = crypto.generateRandomString(5);
  const message = {
    text: 'Your Account has been created with your email: ' +
      body.email +
      ' and temporary password: ' +
      randomPassword +
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
        randomPassword,
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
  const randomPassword = crypto.generateRandomString(5);
  const message = {
    text: 'Your Account has been updated with your email: ' +
      body.email +
      ' and temporary password: ' +
      randomPassword +
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
        randomPassword,
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
