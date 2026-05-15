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

  const works = await models.WorkOrder.findAll({
    where: {
      company_id: user.company_id
    },
    include: [{
      model: models.PropertyUnit,
      include: [{
        model: models.Property
      }]
    }, {
      model: models.Vendor
    }]
  });
  log.debug(works);
  return c.json({ data: works });
});

router.get('/:workId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const work = await models.WorkOrder.findOne({
    where: {
      id: c.req.param('workId')
    },
    include: [{
      model: models.Vendor
    }]
  });
  return c.json(work);
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const startDate = body.start_date || new Date();
  const endDate = body.end_date || new Date();
  let vendorId = body.vendor_id;

  if (!vendorId && body.vendor_name) {
    const vendor = await models.Vendor.create({
      name: body.vendor_name,
      phone: body.vendor_phone,
      email: body.vendor_email,
      company_id: user.company_id
    });
    vendorId = vendor.id;
  }

  const work = await models.WorkOrder.create({
    unit_id: body.unit_id,
    description: body.description,
    status: body.status,
    estimation: body.estimation,
    scheduled_date: new Date(),
    start_date: startDate,
    end_date: endDate,
    vendor_id: vendorId,
    company_id: user.company_id
  });
  return c.json(work);
});

router.put('/:workId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const startDate = body.start_date || new Date();
  const endDate = body.end_date || new Date();
  let vendorId = body.vendor_id;

  if (!vendorId && body.vendor_name) {
    const vendor = await models.Vendor.create({
      name: body.vendor_name,
      phone: body.vendor_phone,
      email: body.vendor_email,
      company_id: user.company_id
    });
    vendorId = vendor.id;
  }

  const work = await models.WorkOrder.findByPk(c.req.param('workId'));
  if (work) {
    await work.update({
      unit_id: body.unit_id,
      description: body.description,
      status: body.status,
      estimation: body.estimation,
      start_date: startDate,
      end_date: endDate,
      vendor_id: vendorId
    });
  }
  return empty(c);
});

router.delete('/:workId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.WorkOrder.destroy({
    where: {
      id: c.req.param('workId')
    }
  });
  return empty(c);
});

module.exports = router;
