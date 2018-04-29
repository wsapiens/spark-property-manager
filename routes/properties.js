const db = require('../db');
const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('SELECT p.id, t.name as type_name, p.address_street, p.address_city, p.address_state, p.address_zip, p.index_number '
         + 'FROM property AS p JOIN property_type AS t on p.type_id = t.id '
         + 'WHERE p.company_id = $1', [ req.session.company_id ])
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

router.get('/:propertyId', function(req, res, next) {
  db.query('SELECT * FROM property WHERE id=$1',[ req.params.propertyId ])
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

router.get('/:propertyId/units', function(req, res, next) {
  db.query('SELECT u.id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building'
        + ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id'
        + ' WHERE p.id=$1',[ req.params.propertyId ])
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        log.error(e.statck);
        res.send(e.stack);
      });
});

router.post('/', function(req, res, next) {
  log.debug("[ create property ]\n");
  log.debug(req.body['type_id']);
  log.debug(req.body['address_street']);
  log.debug(req.body['address_city']);
  log.debug(req.body['address_state']);
  log.debug(req.body['address_zip']);
  log.debug(req.body['index_number']);

  db.query('INSERT INTO property(type_id, address_street, address_city, address_state, address_zip, index_number, company_id)'
           + ' VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [ req.body['type_id'],
              req.body['address_street'],
              req.body['address_city'],
              req.body['address_state'],
              req.body['address_zip'],
              req.body['index_number'],
              req.session.company_id ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.put('/:propertyId', function(req, res, next) {
  log.debug("[ update property ]\n");
  log.debug(req.body['type_id']);
  log.debug(req.body['address_street']);
  log.debug(req.body['address_city']);
  log.debug(req.body['address_state']);
  log.debug(req.body['address_zip']);
  clog.debug(req.body['index_number']);
  log.debug(req.params.propertyId);

  db.query('UPDATE property SET type_id=$1, address_street=$2, address_city=$3, address_state=$4, address_zip=$5, index_number=$6 WHERE id=$7',
          [ req.body['type_id'],
            req.body['address_street'],
            req.body['address_city'],
            req.body['address_state'],
            req.body['address_zip'],
            req.body['index_number'],
            req.params.propertyId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.delete('/:propertyId', function(req, res, next) {
  log.debug("[ delete property ]\n");
  log.debug(req.params.propertyId);

  db.query('DELETE FROM property_unit WHERE property_id=$1',[ req.params.propertyId ])
    .then(rs => {
      db.query('DELETE FROM property WHERE id=$1',[ req.params.propertyId ])
        .then(rs => {
          res.send(rs);
        }).catch(e => {
          console.error(e.stack);
          log.error(e.stack);
          res.send(e.stack);
        });
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
