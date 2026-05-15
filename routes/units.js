const { Hono } = require('hono');
const models = require('../models');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.get('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const units = await models.sequelize.query(
    'SELECT u.id, u.property_id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building' +
      ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id ' +
      ' WHERE p.company_id = $1',
    {
      bind: [user.company_id],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json({ data: units });
});

router.get('/:unitId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const units = await models.sequelize.query(
    'SELECT u.id, u.property_id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building' +
      ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id' +
      ' WHERE u.id=$1',
    {
      bind: [c.req.param('unitId')],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(units[0]);
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  await models.sequelize.query(
    'INSERT INTO property_unit(property_id, name, is_building)' +
      ' VALUES ($1, $2, $3)',
    {
      bind: [
        body.property_id,
        body.name,
        body.is_building
      ],
      type: models.sequelize.QueryTypes.INSERT
    }
  );
  return empty(c);
});

router.put('/:unitId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  await models.sequelize.query(
    'UPDATE property_unit SET property_id=$1, name=$2, is_building=$3' +
      ' WHERE id=$4',
    {
      bind: [
        body.property_id,
        body.name,
        body.is_building,
        c.req.param('unitId')
      ],
      type: models.sequelize.QueryTypes.UPDATE
    }
  );
  return empty(c);
});

router.delete('/:unitId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.PropertyUnit.destroy({
    where: {
      id: c.req.param('unitId')
    }
  });
  return empty(c);
});

module.exports = router;
