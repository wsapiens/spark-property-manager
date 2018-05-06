const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT e.id, p.address_street, u.name, p.address_city, e.pay_to, e.description, t.name AS pay_type, e.amount, e.pay_time, e.file '
             + 'FROM expense AS e '
             + 'LEFT JOIN expense_type AS t ON t.id = e.type_id '
             + 'LEFT JOIN property_unit AS u ON e.unit_id = u.id '
             + 'LEFT JOIN property AS p ON p.id = u.property_id AND p.company_id = $1',
             {
               bind: [ req.session.company_id ],
               type: models.sequelize.QueryTypes.SELECT
             }
        )
        .then(expenses => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": expenses}));
        });
});

router.get('/:expenseId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Expense
        .findById(req.params.expenseId)
        .then(exponse =>{
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(exponse));
        });
});

router.post('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Expense.create({
    unit_id: req.body['unit_id'],
    pay_to: req.body['pay_to'],
    description: req.body['description'],
    type_id: req.body['type_id'],
    amount: req.body['amount'],
    file: req.body['file'],
  }).then(expense => {
    res.send(expense);
  });
});

router.put('/:expenseId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Expense
        .findById(req.params.expenseId)
        .then(expense => {
          if(expense) {
            expense.updateAttributes({
              unit_id: req.body['unit_id'],
              pay_to: req.body['pay_to'],
              type_id: req.body['type_id'],
              description: req.body['description'],
              amount: req.body['amount'],
              pay_time: req.body['pay_time'],
              file: req.body['file'],
            });
          }
        });
  res.send();
});

router.delete('/:expenseId', function(req, res, next) {
  if(!req.session.user_id) {
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
