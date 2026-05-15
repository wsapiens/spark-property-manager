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

  const vendors = await models.Vendor.findAll({
    where: {
      company_id: user.company_id
    }
  });
  log.debug(vendors);
  return c.json({ data: vendors });
});

router.get('/:vendorId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const vendor = await models.Vendor.findByPk(c.req.param('vendorId'));
  return c.json(vendor);
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const vendor = await models.Vendor.create({
    name: body.name,
    phone: body.phone,
    email: body.email,
    category: body.category,
    note: body.note,
    company_id: user.company_id
  });
  return c.json(vendor);
});

router.put('/:vendorId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const vendor = await models.Vendor.findByPk(c.req.param('vendorId'));
  if (vendor) {
    await vendor.update({
      name: body.name,
      phone: body.phone,
      email: body.email,
      category: body.category,
      note: body.note
    });
  }
  return empty(c);
});

router.delete('/:vendorId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  try {
    await models.Vendor.destroy({
      where: {
        id: c.req.param('vendorId')
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
