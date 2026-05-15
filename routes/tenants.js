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

  const tenants = await models.Tenant.findAll({
    where: {
      company_id: user.company_id
    },
    include: [{
      model: models.PropertyUnit,
      include: [{
        model: models.Property
      }]
    }]
  });
  log.debug(tenants);
  return c.json({ data: tenants });
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const tenant = await models.Tenant.create({
    unit_id: body.unit_id,
    firstname: body.firstname,
    lastname: body.lastname,
    phone: body.phone,
    email: body.email,
    lease_start: body.lease_start,
    lease_end: body.lease_end,
    company_id: user.company_id
  });
  return c.json(tenant);
});

router.get('/:tenantId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const tenant = await models.Tenant.findByPk(c.req.param('tenantId'));
  log.debug(tenant);
  return c.json(tenant);
});

router.put('/:tenantId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const tenant = await models.Tenant.findByPk(c.req.param('tenantId'));
  if (tenant) {
    await tenant.update({
      unit_id: body.unit_id,
      firstname: body.firstname,
      lastname: body.lastname,
      phone: body.phone,
      email: body.email,
      lease_start: body.lease_start,
      lease_end: body.lease_end
    });
  }
  return empty(c);
});

router.delete('/:tenantId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.Tenant.destroy({
    where: {
      id: c.req.param('tenantId')
    }
  });
  return empty(c);
});

module.exports = router;
