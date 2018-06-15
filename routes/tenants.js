const log = require('../log');
const email = require('../email');
const config = require('../config');
const models = require('../models');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Tenant.findAll({
    where: {
      company_id: req.user.company_id
    },
    include: [{
        model: models.PropertyUnit,
        include: [{
          model: models.Property
        }]
    }]
  }).then(tenants => {
    log.debug(tenants);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": tenants}));
  });
});

router.post('/', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Tenant.create({
    unit_id: req.body.unit_id,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    phone: req.body.phone,
    email: req.body.email,
    lease_start: req.body.lease_start,
    lease_end: req.body.lease_end,
    company_id: req.user.company_id
  }).then(tenant => {
    res.send(tenant);
  });
});

router.get('/:tenantId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Tenant
        .findById(req.params.tenantId)
        .then(tenant => {
          log.debug(tenant);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(tenant));
        });
});

router.put('/:tenantId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Tenant
    .findById(req.params.tenantId)
    .then(tenant => {
      if(tenant) {
        tenant.updateAttributes({
          unit_id: req.body.unit_id,
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          phone: req.body.phone,
          email: req.body.email,
          lease_start: req.body.lease_start,
          lease_end: req.body.lease_end,
        });
      }
    });
  res.send();
});

router.delete('/:tenantId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
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

module.exports = router;
