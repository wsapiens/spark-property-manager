const { Hono } = require('hono');
const models = require('../models');
const util = require('../util');
const { empty, getQuery, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

function dateRange(query) {
  let startDate = [1900, 1, 1].join('-');
  if (query.start !== undefined) {
    startDate = query.start;
  }
  let endDate = new Date();
  if (query.end !== undefined) {
    endDate = query.end + ' 23:59:59';
  }
  return { startDate, endDate };
}

function chartDataset(rows, labelGetter, valueGetter, datasetOptions) {
  const data = [];
  const label = [];
  const color = [];
  const bcolor = [];
  rows.forEach(function(row) {
    label.push(labelGetter(row));
    data.push(valueGetter(row));
    const rgb = util.getRandomRGB();
    bcolor.push('rgb(' + rgb.join(',') + ')');
    rgb.push('0.2');
    color.push('rgba(' + rgb.join(',') + ')');
  });
  return {
    datasets: [
      Object.assign({
        data: data,
        backgroundColor: color,
        borderColor: bcolor,
        borderWidth: 1
      }, datasetOptions || {})
    ],
    labels: label
  };
}

router.get('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const range = dateRange(query);
  const expenses = await models.sequelize.query(
    'SELECT e.id, p.address_street, u.name AS unit_name, p.address_city, e.pay_to, e.description, t.name AS pay_type, pt.name AS pay_method, pm.account_number AS pay_account, e.amount, e.pay_time, e.file ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id  ' +
      'LEFT JOIN payment_method AS pm ON e.method_id = pm.id ' +
      'LEFT JOIN payment_type AS pt ON pm.type_id = pt.id ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'ORDER BY e.pay_time DESC',
    {
      bind: [user.company_id, range.startDate, range.endDate],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json({ data: expenses });
});

router.get('/report', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const range = dateRange(query);
  const expenses = await models.sequelize.query(
    'SELECT e.id, ' +
      'p.address_street As address_street, ' +
      "(CASE WHEN u.name LIKE '%ffice%' THEN 'Home Office' ELSE u.name END) AS unit_name, " +
      'p.address_city, ' +
      'e.pay_to, ' +
      'e.description, ' +
      't.name AS pay_type, ' +
      'pt.name AS pay_method, ' +
      'pm.account_number AS pay_account, ' +
      'e.amount, ' +
      'e.pay_time, ' +
      'e.file ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id  ' +
      'LEFT JOIN payment_method AS pm ON e.method_id = pm.id ' +
      'LEFT JOIN payment_type AS pt ON pm.type_id = pt.id ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'ORDER BY address_street, unit_name, pay_type, e.pay_time',
    {
      bind: [user.company_id, range.startDate, range.endDate],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json({ data: expenses });
});

router.get('/types/properties/report', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    'SELECT * FROM ( ' +
      'SELECT * FROM ( ' +
      'SELECT p.address_street as street, t.name as type, SUM(e.amount) ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      "WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name NOT LIKE '%ffice%' " +
      'GROUP BY p.id, t.name) prop_sub ' +
      'UNION ' +
      'SELECT * FROM (' +
      "SELECT 'Home Office' as street, t.name as type, SUM(e.amount) " +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      "WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name LIKE '%ffice%' " +
      'GROUP BY p.id, u.id, t.name) office_sub ' +
      ') union_sub ' +
      'ORDER BY street, type',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(chartDataset(
    expenses,
    function(expense) { return expense.street + ', ' + expense.type; },
    function(expense) { return expense.sum; },
    { label: 'Expense by Property and Type' }
  ));
});

router.get('/types', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    'SELECT t.name AS pay_type, SUM(e.amount) ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id  ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'GROUP BY pay_type',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(chartDataset(
    expenses,
    function(expense) { return expense.pay_type; },
    function(expense) { return expense.sum; }
  ));
});

router.get('/properties', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    'SELECT p.address_street, SUM(e.amount) ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'GROUP BY p.id ',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(chartDataset(
    expenses,
    function(expense) { return expense.address_street; },
    function(expense) { return expense.sum; }
  ));
});

router.get('/properties/report', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    'SELECT * FROM ( ' +
      'SELECT * FROM ( ' +
      'SELECT p.address_street AS street, SUM(e.amount) ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      "WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name NOT LIKE '%ffice%' " +
      'GROUP BY p.id ) prop_sub ' +
      'UNION ' +
      'SELECT * FROM ( ' +
      "SELECT 'Home Office' AS street, SUM(e.amount) " +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      "WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name LIKE '%ffice%' " +
      'GROUP BY p.id, u.id) office_sub ' +
      ') union_sub ' +
      'ORDER BY street',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(chartDataset(
    expenses,
    function(expense) { return expense.street; },
    function(expense) { return expense.sum; }
  ));
});

router.get('/units', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    'SELECT p.address_street, u.name, SUM(e.amount) ' +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'GROUP BY p.id, u.id',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  return c.json(chartDataset(
    expenses,
    function(expense) { return expense.address_street + ', ' + expense.name; },
    function(expense) { return expense.sum; }
  ));
});

router.get('/times', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const query = getQuery(c);
  const expenses = await models.sequelize.query(
    "SELECT to_char(e.pay_time, 'YYYY-MM') AS time, SUM(e.amount) " +
      'FROM expense AS e ' +
      'INNER JOIN expense_type AS t ON t.id = e.type_id ' +
      'INNER JOIN property_unit AS u ON e.unit_id = u.id ' +
      'INNER JOIN property AS p ON p.id = u.property_id ' +
      'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 ' +
      'GROUP BY time ' +
      'ORDER BY time ',
    {
      bind: [user.company_id, query.start, query.end],
      type: models.sequelize.QueryTypes.SELECT
    }
  );
  let sum = 0.0;
  const accumulate = [];
  const chart = chartDataset(
    expenses,
    function(expense) { return expense.time; },
    function(expense) {
      sum += parseFloat(expense.sum);
      accumulate.push(sum.toFixed(2));
      return expense.sum;
    },
    {
      label: 'Each Month',
      fill: false
    }
  );
  chart.datasets.push({
    label: 'Accumulated',
    data: accumulate,
    type: 'line',
    fill: false,
    yAxisID: 'logarithmic',
    borderColor: 'rgb(54, 162, 235)'
  });
  return c.json(chart);
});

router.get('/:expenseId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const expense = await models.Expense.findByPk(c.req.param('expenseId'));
  return c.json(expense);
});

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const expense = await models.Expense.create({
    unit_id: body.unit_id,
    pay_to: body.pay_to,
    description: body.description,
    type_id: body.type_id,
    method_id: body.method_id,
    amount: body.amount,
    pay_time: body.pay_time,
    file: body.file
  });
  return c.json(expense);
});

router.put('/:expenseId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  const expense = await models.Expense.findByPk(c.req.param('expenseId'));
  if (expense) {
    await expense.update({
      unit_id: body.unit_id,
      pay_to: body.pay_to,
      type_id: body.type_id,
      method_id: body.method_id,
      description: body.description,
      amount: body.amount,
      pay_time: body.pay_time,
      file: body.file
    });
  }
  return empty(c);
});

router.delete('/:expenseId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  await models.Expense.destroy({
    where: {
      id: c.req.param('expenseId')
    }
  });
  return empty(c);
});

module.exports = router;
