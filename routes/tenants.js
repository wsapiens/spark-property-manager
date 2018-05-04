const log = require('../log');
const email = require('../email');
const config = require('../config');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Tenant.findAll({
    where: {
      company_id: req.session.company_id
    },
    include: [{
        model: models.PropertyUnit,
        include: [{
          model: models.Property
        }]
    }]
  }).then(function(tenants){
    log.debug(tenants);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": tenants}));
  })
});

router.post('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Tenant.create({
    unit_id: req.body['unit_id'],
    firstname: req.body['firstname'],
    lastname: req.body['lastname'],
    phone: req.body['phone'],
    email: req.body['email'],
    lease_start: req.body['lease_start'],
    lease_end: req.body['lease_end'],
    company_id: req.session.company_id
  }).then(function(tenant) {
    res.send(tenant);
  });
});

router.get('/:tenantId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Tenant.find({
    where: {
      id: req.params.tenantId
    }
  }).then(function(tenant) {
    log.debug(tenant);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(tenant));
  });
});

router.put('/:tenantId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Tenant
    .findById(req.params.tenantId)
    .then(function(tenant){
      if(tenant) {
        tenant.updateAttributes({
          unit_id: req.body['unit_id'],
          firstname: req.body['firstname'],
          lastname: req.body['lastname'],
          phone: req.body['phone'],
          email: req.body['email'],
          lease_start: req.body['lease_start'],
          lease_end: req.body['lease_end'],
        });
      }
    });
    res.send();
});

router.delete('/:tenantId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.Tenant.destroy({
    where: {
      id: req.params.tenantId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router
