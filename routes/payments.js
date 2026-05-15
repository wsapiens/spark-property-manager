const { Hono } = require('hono');
const log = require('../log');
const models = require('../models');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/methods', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const methods = await models.PaymentMethod.findAll({
    where: {
      company_id: user.company_id
    },
    include: [{
      model: models.PaymentType
    }]
  });
  return c.json({ data: methods });
});

router.get('/methods/:methodId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const method = await models.PaymentMethod.findByPk(c.req.param('methodId'));
  return c.json(method);
});

router.post('/methods', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const method = await models.PaymentMethod.create({
    type_id: body.type_id,
    description: body.description,
    account_number: body.account_number,
    company_id: user.company_id
  });
  return c.json(method);
});

router.put('/methods/:methodId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const method = await models.PaymentMethod.findByPk(c.req.param('methodId'));
  if (method) {
    await method.update({
      type_id: body.type_id,
      description: body.description,
      account_number: body.account_number
    });
  }
  return empty(c);
});

router.delete('/methods/:methodId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  try {
    await models.PaymentMethod.destroy({
      where: {
        id: c.req.param('methodId')
      }
    });
    return empty(c);
  } catch (err) {
    log.error(err.message);
    log.error(err.stack);
    return c.text(err.message, 400);
  }
});

module.exports = router;
