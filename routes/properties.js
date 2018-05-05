const db = require('../db');
const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Property.findAll({
    where: {
      company_id: req.session.company_id
    },
    include: [{
        model: models.PropertyType
    }]
  }).then(properties => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": properties}));
  });
});

router.get('/:propertyId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Property.find({
    where: {
      id: req.params.propertyId
    }
  }).then(property => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(property));
  });
});

router.get('/:propertyId/units', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
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
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Property.create({
    type_id: req.body['type_id'],
    address_street: req.body['address_street'],
    address_city: req.body['address_city'],
    address_state: req.body['address_state'],
    address_zip: req.body['address_zip'],
    index_number: req.body['index_number'],
    company_id:req.session.company_id
  }).then(property => {
    res.send(property);
  });
});

router.put('/:propertyId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }

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
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
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
