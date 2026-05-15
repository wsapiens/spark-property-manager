const { Hono } = require('hono');
const log = require('../log');
const util = require('../util');
const models = require('../models');
const csv = require('fast-csv');
const validator = require('validator');
const moment = require('moment-timezone');
const { getQuery, renderLogin, requireUser, uploadSingle } = require('../lib/hono-helpers');

const router = new Hono();

router.post('/receipt', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const file = await uploadSingle(c, 'receipt');
  if (!file) {
    return c.text('No files were uploaded.', 400);
  }

  console.log(file.filename);
  console.log(file.originalname);
  return c.text(file.filename);
});

router.post('/statement/:methodId', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const file = await uploadSingle(c, 'statement');
  if (!file) {
    return c.text('No files were uploaded.', 400);
  }

  const query = getQuery(c);
  let row = 0;
  const expenses = [];
  const importStatementConfig = await models.ImportStatementConfig.findAll({
    where: {
      company_id: user.company_id
    },
    limit: 1
  });
  const importConfig = importStatementConfig[0];
  const expenseTypes = await models.ExpenseType.findAll();
  const properties = await models.Property.findAll({
    where: {
      company_id: user.company_id
    },
    include: [{
      model: models.PropertyUnit
    }]
  });
  let defaultUnitId = properties[0].PropertyUnits[0].id;
  if (query.unitId !== null) {
    defaultUnitId = query.unitId;
  }

  await new Promise(function(resolve, reject) {
    csv.parseFile(file.path)
      .on('data', function(data) {
        console.log(data);
        row++;
        if (row === 1) {
          return;
        }
        const filter = data[importConfig.filter_column_number];
        const regex = new RegExp(importConfig.filter_keyword.replace(',', '|'), 'i');
        if (regex.test(filter)) {
          let expenseTypeId = 9;
          for (let i = 0; i < expenseTypes.length; i++) {
            if (data[importConfig.category_column_number].includes(expenseTypes[i].name)) {
              expenseTypeId = expenseTypes[i].id;
            }
          }
          expenses.push({
            unit_id: defaultUnitId,
            pay_to: data[importConfig.pay_to_column_number],
            type_id: expenseTypeId,
            description: util.getImportDescription(
              data[importConfig.description_column_number],
              data[importConfig.filter_column_number]
            ),
            amount: util.getImportAmount(
              parseFloat(data[importConfig.amount_column_number]),
              data[importConfig.filter_column_number]
            ),
            pay_time: new Date(moment.tz(
              data[importConfig.date_column_number],
              importConfig.date_format,
              query.tzId
            ).format()),
            method_id: c.req.param('methodId'),
            file: ''
          });
        }
      })
      .on('error', reject)
      .on('end', async function() {
        try {
          console.log(expenses);
          await models.Expense.bulkCreate(expenses, { returning: true });
          log.info('import done for user_id: ' + user.id);
          console.log('import done for user_id: ' + user.id);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
  });

  return c.text(validator.escape(file.originalname));
});

module.exports = router;
