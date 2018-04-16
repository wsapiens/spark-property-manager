const db = require('../db');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('SELECT e.id, p.address_street, u.name, p.address_city, e.pay_to, e.description, t.name AS pay_type, e.amount, e.pay_time '
          + 'FROM expense AS e '
          + 'JOIN property_unit AS u ON e.unit_id = u.id '
          + 'JOIN property AS p ON u.property_id = p.id '
          + 'LEFT JOIN expense_type AS t ON t.id = e.type_id')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

router.get('/:expenseId', function(req, res, next) {
  db.query('SELECT * FROM expense WHERE id=$1',[ req.params.expenseId ])
      .then(rs => {
        console.log(rs.rows[0]);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs.rows[0]));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

router.post('/', function(req, res, next) {
  console.log("[ create expense ]\n");
  console.log(req.body['unit_id']);
  console.log(req.body['pay_to']);
  console.log(req.body['description']);
  console.log(req.body['type_id']);
  console.log(req.body['amount']);

  db.query('INSERT INTO expense(unit_id, pay_to, description, type_id, amount) VALUES ($1, $2, $3, $4, $5)',
            [ req.body['unit_id'],
              req.body['pay_to'],
              req.body['description'],
              req.body['type_id'],
              req.body['amount'] ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

router.put('/:expenseId', function(req, res, next) {
  console.log("[ update expense ]\n");
  console.log(req.body['unit_id']);
  console.log(req.body['pay_to']);
  console.log(req.body['type_id']);
  console.log(req.body['description']);
  console.log(req.body['amount']);
  console.log(req.body['pay_time']);
  console.log(req.params.expenseId);

  db.query('UPDATE expense SET unit_id=$1, pay_to=$2, description=$3, type_id=$4, amount=$5, pay_time=$6 WHERE id=$7',
            [ req.body['unit_id'],
              req.body['pay_to'],
              req.body['description'],
              req.body['type_id'],
              req.body['amount'],
              req.body['pay_time'],
              req.params.expenseId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

router.delete('/:expenseId', function(req, res, next) {
  console.log("[ delete expense ]\n");
  console.log(req.params.expenseId);

  db.query('DELETE FROM expense WHERE id=$1',[ req.params.expenseId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
