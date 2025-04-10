const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Property.findAll({
    where: {
      company_id: req.user.company_id
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
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Property.findByPk(req.params.propertyId)
    .then(property => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(property));
  });
});

router.get('/:propertyId/units', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Property.findAll({
    where: {
      id: req.params.propertyId
    },
    include: [{
        model: models.PropertyUnit
    }]
  }).then(properties => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": properties}));
  });
});

router.post('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Property.create({
    type_id: req.body.type_id,
    address_street: req.body.address_street,
    address_city: req.body.address_city,
    address_state: req.body.address_state,
    address_zip: req.body.address_zip,
    index_number: req.body.index_number,
    loan_info: req.body.loan_info,
    memo: req.body.memo,
    company_id:req.user.company_id
  }).then(property => {
    if(property.type_id !== 3) {
      models.PropertyUnit.create({
        property_id: property.id,
        name: 'Building',
        is_building: true
      }).then(unit => {
        log.info('default unit has been created for propertyId: ' + property.id);
      });
    }
    res.send(property);
  });
});

router.put('/:propertyId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Property
        .findByPk(req.params.propertyId)
        .then(property => {
          if(property) {
            property.update({
              type_id: req.body.type_id,
              address_street: req.body.address_street,
              address_city: req.body.address_city,
              address_state: req.body.address_state,
              address_zip: req.body.address_zip,
              index_number: req.body.index_number,
              loan_info: req.body.loan_info,
              memo: req.body.memo,
            });
          }
        });
  res.send();
});

router.delete('/:propertyId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PropertyUnit.destroy({
    where: {
      property_id: req.params.propertyId
    }
  });
  models.Property.destroy({
    where: {
      id: req.params.propertyId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
