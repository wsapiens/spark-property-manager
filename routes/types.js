const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.ExpenseType
        .findAll()
        .then(types => {
          log.debug(types);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": types}));
        });
});

router.get('/property', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.PropertyType
        .findAll()
        .then(types => {
          log.debug(types);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": types}));
        });
});

module.exports = router;
