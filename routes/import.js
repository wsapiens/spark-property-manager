const { Hono } = require('hono');
const models = require('../models');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/configs', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const importConfig = await models.ImportStatementConfig.findAll({
    where: {
      company_id: user.company_id
    }
  });
  return c.json({ data: importConfig });
});

router.post('/configs', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const importConfig = await models.ImportStatementConfig.create({
    filter_column_number: body.filter_column_number,
    filter_keyword: body.filter_keyword,
    date_column_number: body.date_column_number,
    date_format: body.date_format,
    pay_to_column_number: body.pay_to_column_number,
    amount_column_number: body.amount_column_number,
    category_column_number: body.category_column_number,
    description_column_number: body.description_column_number,
    company_id: user.company_id
  });
  return c.json(importConfig);
});

router.get('/configs/:configId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const importConfig = await models.ImportStatementConfig.findByPk(c.req.param('configId'));
  return c.json(importConfig);
});

router.put('/configs/:configId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const importConfig = await models.ImportStatementConfig.findByPk(c.req.param('configId'));
  if (importConfig) {
    await importConfig.update({
      filter_column_number: body.filter_column_number,
      filter_keyword: body.filter_keyword,
      date_column_number: body.date_column_number,
      date_format: body.date_format,
      pay_to_column_number: body.pay_to_column_number,
      amount_column_number: body.amount_column_number,
      category_column_number: body.category_column_number,
      description_column_number: body.description_column_number
    });
  }
  return empty(c);
});

router.delete('/configs/:configId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.ImportStatementConfig.destroy({
    where: {
      id: c.req.param('configId')
    }
  });
  return empty(c);
});

module.exports = router;
