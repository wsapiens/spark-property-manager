const log = require('../log');
const models = require('../models');
const util = require('../util');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var startDate = [1900, 1, 1].join("-");
  if(undefined !== req.query.start){
    startDate = req.query.start;
  }
  var endDate = new Date();
  if(undefined !== req.query.end ) {
    endDate = req.query.end + ' 23:59:59'; // add 23h 59m 59s
  }
  models.sequelize
        .query('SELECT e.id, '
          + 'p.address_street As address_street, '
          + '(CASE WHEN u.name LIKE \'%ffice%\' THEN \'Home Office\' ELSE u.name END) AS unit_name, '
          + 'p.address_city, '
          + 'e.pay_to, '
          + 'e.description, '
          + 't.name AS pay_type, '
          + 'pt.name AS pay_method, '
          + 'pm.account_number AS pay_account, '
          + 'e.amount, '
          + 'e.pay_time, '
          + 'e.file '
          + 'FROM expense AS e '
          + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
          + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
          + 'INNER JOIN property AS p ON p.id = u.property_id  '
          + 'LEFT JOIN payment_method AS pm ON e.method_id = pm.id '
          + 'LEFT JOIN payment_type AS pt ON pm.type_id = pt.id '
          + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 '
          + 'ORDER BY address_street, unit_name, pay_type, e.pay_time',
             {
               bind: [ req.user.company_id, startDate, endDate ],
               type: models.sequelize.QueryTypes.SELECT
             }
        ).then(expenses => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": expenses}));
        });
});

// Retrieve total expenses by type per property, treating Home Office as a separate entity.
router.get('/types/properties-office', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT * FROM ( '
          + 'SELECT * FROM ( '
          + 'SELECT p.address_street as street, t.name as type, SUM(e.amount) '
          + 'FROM expense AS e '
          + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
          + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
          + 'INNER JOIN property AS p ON p.id = u.property_id '
          + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name NOT LIKE \'%ffice%\' '
          + 'GROUP BY p.id, t.name) prop_sub '
          + 'UNION '
          + 'SELECT * FROM ('
          + 'SELECT \'Home Office\' as street, t.name as type, SUM(e.amount) '
          + 'FROM expense AS e '
          + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
          + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
          + 'INNER JOIN property AS p ON p.id = u.property_id '
          + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name LIKE \'%ffice%\' '
          + 'GROUP BY p.id, u.id, t.name) office_sub '
          + ') union_sub '
          + 'ORDER BY street, type',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        ).then(expenses => {
          var data = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.street+", "+expense.type);
            data.push(expense.sum);
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                label: 'Expense by Property and Type',
                data: data,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              }
            ],
            labels: label
          }));
        });
});

router.get('/types', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT t.name AS pay_type, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id  '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 '
             + 'GROUP BY pay_type',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        ).then(expenses => {
          var data = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.pay_type);
            data.push(expense.sum);
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                data: data,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              }
            ],
            labels: label
          }));
        });
});

router.get('/properties', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT p.address_street, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 '
             + 'GROUP BY p.id ',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        )
        .then(expenses => {
          var data = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.address_street);
            data.push(expense.sum);
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                data: data,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              }
            ],
            labels: label
          }));
        });
});

// Calculate total expenses per property, treating Home Office as a separate entity.
router.get('/properties-office', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT * FROM ( '
             + 'SELECT * FROM ( '
             + 'SELECT p.address_street AS street, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name NOT LIKE \'%ffice%\' '
             + 'GROUP BY p.id ) prop_sub '
             + 'UNION '
             + 'SELECT * FROM ( '
             + 'SELECT \'Home Office\' AS street, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 AND u.name LIKE \'%ffice%\' '
             + 'GROUP BY p.id, u.id) office_sub '
             + ') union_sub '
             + 'ORDER BY street',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        )
        .then(expenses => {
          var data = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.street);
            data.push(expense.sum);
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                data: data,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              }
            ],
            labels: label
          }));
        });
});

router.get('/units', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT p.address_street, u.name, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 '
             + 'GROUP BY p.id, u.id',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        ).then(expenses => {
          var data = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.address_street+", "+expense.name);
            data.push(expense.sum);
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                data: data,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              }
            ],
            labels: label
          }));
        });
});

router.get('/times', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT to_char(e.pay_time, \'YYYY-MM\') AS time, SUM(e.amount) '
             + 'FROM expense AS e '
             + 'INNER JOIN expense_type AS t ON t.id = e.type_id '
             + 'INNER JOIN property_unit AS u ON e.unit_id = u.id '
             + 'INNER JOIN property AS p ON p.id = u.property_id '
             + 'WHERE p.company_id = $1 AND e.pay_time >= $2 AND e.pay_time <= $3 '
             + 'GROUP BY time '
             + 'ORDER BY time ',
             {
               bind: [ req.user.company_id, req.query.start, req.query.end ],
               type: models.sequelize.QueryTypes.SELECT
             }
        )
        .then(expenses => {
          var sum = 0.0;
          var data = [];
          var accumulate = [];
          var label = [];
          var color = [];
          var bcolor = [];
          expenses.forEach(function(expense){
            label.push(expense.time);
            data.push(expense.sum);
            sum += parseFloat(expense.sum);
            accumulate.push(sum.toFixed(2));
            let rgb = util.getRandomRGB();
            bcolor.push("rgb(" + rgb.join(",") + ")");
            rgb.push('0.2');
            color.push("rgba(" + rgb.join(",") + ")");
          });
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({
            datasets: [
              {
                label: 'Each Month',
                data: data,
                fill: false,
                backgroundColor: color,
                borderColor: bcolor,
                borderWidth:1
              },
              {
                label: 'Accumulated',
                data: accumulate,
                type: 'line',
                fill: false,
                yAxisID: 'logarithmic',
                borderColor: 'rgb(54, 162, 235)'
              }
            ],
            labels: label
          }));
        });
});

router.get('/:expenseId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Expense
        .findByPk(req.params.expenseId)
        .then(exponse =>{
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(exponse));
        });
});

router.post('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Expense.create({
    unit_id: req.body.unit_id,
    pay_to: req.body.pay_to,
    description: req.body.description,
    type_id: req.body.type_id,
    method_id: req.body.method_id,
    amount: req.body.amount,
    pay_time: req.body.pay_time,
    file: req.body.file,
  }).then(expense => {
    res.send(expense);
  });
});

router.put('/:expenseId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Expense
        .findByPk(req.params.expenseId)
        .then(expense => {
          if(expense) {
            expense.update({
              unit_id: req.body.unit_id,
              pay_to: req.body.pay_to,
              type_id: req.body.type_id,
              method_id: req.body.method_id,
              description: req.body.description,
              amount: req.body.amount,
              pay_time: req.body.pay_time,
              file: req.body.file,
            });
          }
        });
  res.send();
});

router.delete('/:expenseId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Expense.destroy({
    where: {
      id: req.params.expenseId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
