const db = require('../db');
const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('SELECT e.id, p.address_street, u.name, p.address_city, e.pay_to, e.description, t.name AS pay_type, e.amount, e.pay_time, e.file '
         + 'FROM expense AS e '
         + 'LEFT JOIN expense_type AS t ON t.id = e.type_id '
         + 'LEFT JOIN property_unit AS u ON e.unit_id = u.id '
         + 'LEFT JOIN property AS p ON p.id = u.property_id AND p.company_id = $1', [ req.session.company_id ])
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        log.error(e.stack);
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
        log.error(e.stack);
        res.send(e.stack);
      });
});

router.post('/', function(req, res, next) {
  log.debug("[ create expense ]\n");
  log.debug(req.body['unit_id']);
  log.debug(req.body['pay_to']);
  log.debug(req.body['description']);
  log.debug(req.body['type_id']);
  log.debug(req.body['amount']);
  log.debug(req.body['file']);

  db.query('INSERT INTO expense(unit_id, pay_to, description, type_id, amount, file) VALUES ($1, $2, $3, $4, $5, $6)',
            [ req.body['unit_id'],
              req.body['pay_to'],
              req.body['description'],
              req.body['type_id'],
              req.body['amount'],
              req.body['file'] ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.put('/:expenseId', function(req, res, next) {
  log.debug("[ update expense ]\n");
  log.debug(req.body['unit_id']);
  log.debug(req.body['pay_to']);
  log.debug(req.body['type_id']);
  log.debug(req.body['description']);
  log.debug(req.body['amount']);
  log.debug(req.body['pay_time']);
  log.debug(req.body['file']);
  log.debug(req.params.expenseId);

  db.query('UPDATE expense SET unit_id=$1, pay_to=$2, description=$3, type_id=$4, amount=$5, pay_time=$6, file=$7 WHERE id=$8',
            [ req.body['unit_id'],
              req.body['pay_to'],
              req.body['description'],
              req.body['type_id'],
              req.body['amount'],
              req.body['pay_time'],
              req.body['file'],
              req.params.expenseId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.delete('/:expenseId', function(req, res, next) {
  log.debug("[ delete expense ]\n");
  log.debug(req.params.expenseId);

  db.query('DELETE FROM expense WHERE id=$1',[ req.params.expenseId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
