const db = require('../db');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('SELECT u.id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building'
        + ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

router.get('/:unitId', function(req, res, next) {
  db.query('SELECT u.id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building'
        + ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id'
        + ' WHERE u.id=$1', [ req.params.unitId ])
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
  console.log("[ create unit ]\n");
  console.log(req.body['property_id']);
  console.log(req.body['name']);
  console.log(req.body['is_building']);

  db.query('INSERT INTO property_unit(property_id, name, is_building)'
           + ' VALUES ($1, $2, $3)',
            [ req.body['property_id'],
              req.body['name'],
              req.body['is_building'] ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

router.put('/:unitId', function(req, res, next) {
  console.log("[ update unit ]\n");
  console.log(req.body['property_id']);
  console.log(req.body['name']);
  console.log(req.body['is_building']);
  console.log(req.params.unitId);

  db.query('UPDATE property_unit SET property_id=$1, name=$2, is_building=$3'
           + ' WHERE id=$4',
            [ req.body['property_id'],
              req.body['name'],
              req.body['is_building'],
              req.params.unitId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

router.delete('/:unitId', function(req, res, next) {
  console.log("[ delete unit ]\n");
  console.log(req.params.unitId);

  db.query('DELETE FROM property_unit WHERE id=$1', [ req.params.unitId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
