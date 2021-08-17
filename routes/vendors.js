const log = require('../log');
const models = require('../models');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Vendor
        .findAll({
          where: {
            company_id: req.user.company_id
          }
        }).then(vendors => {
          log.debug(vendors);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": vendors}));
        });
});

router.get('/:vendorId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Vendor
        .findByPk(req.params.vendorId)
        .then(vendor =>{
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(vendor));
        });
});

router.post('/', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Vendor.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    category: req.body.category,
    note: req.body.note,
    company_id: req.user.company_id
  }).then(vendor => {
    res.send(vendor);
  });
});

router.put('/:vendorId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Vendor
        .findByPk(req.params.vendorId)
        .then(vendor => {
          if(vendor) {
            vendor.update({
              name: req.body.name,
              phone: req.body.phone,
              email: req.body.email,
              category: req.body.category,
              note: req.body.note
            });
          }
        });
  res.send();
});

router.delete('/:vendorId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.Vendor.destroy({
    where: {
      id: req.params.vendorId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
