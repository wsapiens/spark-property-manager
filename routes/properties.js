const db = require('../db');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('SELECT * FROM property')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

router.post('/', function(req, res, next) {
  console.log("[ create property ]\n");
  console.log(req.body['type_id']);
  console.log(req.body['address_street']);
  console.log(req.body['address_city']);
  console.log(req.body['address_state']);
  console.log(req.body['address_zip']);
  console.log(req.body['index_number']);

  db.query('INSERT INTO property(type_id, address_street, address_city, address_state, address_zip, index_number)'
           + ' VALUES ($1, $2, $3, $4, $5, $6)',
            [ req.body['type_id'],
              req.body['address_street'],
              req.body['address_city'],
              req.body['address_state'],
              req.body['address_zip'],
              req.body['index_number'] ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

router.put('/:propertyId', function(req, res, next) {
  console.log("[ update property ]\n");
  console.log(req.body['type_id']);
  console.log(req.body['address_street']);
  console.log(req.body['address_city']);
  console.log(req.body['address_state']);
  console.log(req.body['address_zip']);
  console.log(req.body['index_number']);
  console.log(req.params.propertyId);

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
      res.send(e.stack);
    });
});

router.delete('/:propertyId', function(req, res, next) {
  console.log("[ delete property ]\n");
  console.log(req.params.propertyId);

  db.query('DELETE FROM property_unit WHERE property_id=$1',[ req.params.propertyId ])
    .then(rs => {
      db.query('DELETE FROM property WHERE id=$1',[ req.params.propertyId ])
        .then(rs => {
          res.send(rs);
        }).catch(e => {
          console.error(e.stack);
          res.send(e.stack);
        });
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
