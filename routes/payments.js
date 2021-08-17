const log = require('../log');
const models = require('../models');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var router = express.Router();

router.get('/methods', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PaymentMethod.findAll({
    where: {
      company_id: req.user.company_id
    },
    include: [{
        model: models.PaymentType
    }]
  }).then(methods => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": methods}));
  });
});

router.get('/methods/:methodId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PaymentMethod.findByPk(req.params.methodId)
    .then(method => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(method));
  });
});

router.post('/methods/', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PaymentMethod.create({
    type_id: req.body.type_id,
    description: req.body.description,
    account_number: req.body.account_number,
    company_id:req.user.company_id
  }).then(method => {
    res.send(method);
  });
});

router.put('/methods/:methodId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PaymentMethod
        .findByPk(req.params.methodId)
        .then(method => {
          if(method) {
            method.update({
              type_id: req.body.type_id,
              description: req.body.description,
              account_number: req.body.account_number
            });
          }
        });
  res.send();
});

router.delete('/methods/:methodId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PaymentMethod.destroy({
    where: {
      id: req.params.methodId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
