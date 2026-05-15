const { Hono } = require('hono');
const log = require('../log');
const models = require('../models');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const properties = await models.Property.findAll({
    where: {
      company_id: user.company_id
    },
    include: [{
      model: models.PropertyType
    }]
  });
  return c.json({ data: properties });
});

router.get('/:propertyId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const property = await models.Property.findByPk(c.req.param('propertyId'));
  return c.json(property);
});

router.get('/:propertyId/units', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const properties = await models.Property.findAll({
    where: {
      id: c.req.param('propertyId')
    },
    include: [{
      model: models.PropertyUnit
    }]
  });
  return c.json({ data: properties });
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const property = await models.Property.create({
    type_id: body.type_id,
    address_street: body.address_street,
    address_city: body.address_city,
    address_state: body.address_state,
    address_zip: body.address_zip,
    index_number: body.index_number,
    loan_info: body.loan_info,
    memo: body.memo,
    company_id: user.company_id
  });

  if (property.type_id !== 3) {
    await models.PropertyUnit.create({
      property_id: property.id,
      name: 'Building',
      is_building: true
    });
    log.info('default unit has been created for propertyId: ' + property.id);
  }

  return c.json(property);
});

router.put('/:propertyId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const property = await models.Property.findByPk(c.req.param('propertyId'));
  if (property) {
    await property.update({
      type_id: body.type_id,
      address_street: body.address_street,
      address_city: body.address_city,
      address_state: body.address_state,
      address_zip: body.address_zip,
      index_number: body.index_number,
      loan_info: body.loan_info,
      memo: body.memo
    });
  }
  return empty(c);
});

router.delete('/:propertyId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.PropertyUnit.destroy({
    where: {
      property_id: c.req.param('propertyId')
    }
  });
  await models.Property.destroy({
    where: {
      id: c.req.param('propertyId')
    }
  });
  return empty(c);
});

module.exports = router;
