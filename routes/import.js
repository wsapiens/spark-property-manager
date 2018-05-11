const log = require('../log');
const config = require('../config');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/configs', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.ImportStatementConfig
        .findAll({
    where: {
      company_id: req.session.company_id
    }
  }).then(importConfig => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": importConfig}));
  });
});

router.post('/configs', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.ImportStatementConfig
        .create({
          filter_column_number: req.body['filter_column_number'],
          filter_keyword: req.body['filter_keyword'],
          date_column_number: req.body['date_column_number'],
          date_format: req.body['date_format'],
          pay_to_column_number: req.body['pay_to_column_number'],
          amount_column_number: req.body['amount_column_number'],
          category_column_number: req.body['category_column_number'],
          description_column_number: req.body['description_column_number'],
          company_id: req.session.company_id
        }).then(importConfig => {
          res.send(importConfig);
        });
});

router.get('/configs/:configId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.ImportStatementConfig
        .findById(req.params.configId)
        .then(importConfig => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(importConfig));
        });
});

router.put('/configs/:configId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.ImportStatementConfig
        .findById(req.params.configId)
        .then(importConfig => {
          if(importConfig) {
            importConfig.updateAttributes({
              filter_column_number: req.body['filter_column_number'],
              filter_keyword: req.body['filter_keyword'],
              date_column_number: req.body['date_column_number'],
              date_format: req.body['date_format'],
              pay_to_column_number: req.body['pay_to_column_number'],
              amount_column_number: req.body['amount_column_number'],
              category_column_number: req.body['category_column_number'],
              description_column_number: req.body['description_column_number']
            });
          }
        });
  res.send();
});

router.delete('/configs/:configId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.ImportStatementConfig.destroy({
    where: {
      id: req.params.configId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router
