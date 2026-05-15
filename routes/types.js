const { Hono } = require('hono');
const log = require('../log');
const models = require('../models');
const { renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/expense', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const types = await models.ExpenseType.findAll();
  log.debug(types);
  return c.json({ data: types });
});

router.get('/property', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const types = await models.PropertyType.findAll();
  log.debug(types);
  return c.json({ data: types });
});

router.get('/payment', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const types = await models.PaymentType.findAll();
  log.debug(types);
  return c.json({ data: types });
});

module.exports = router;
