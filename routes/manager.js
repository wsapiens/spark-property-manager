const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('expense', { title: 'Expense Manager', manager: req.session.is_manager });
});

router.get('/property', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('property', { title: 'Property Manager', manager: req.session.is_manager });
});

router.get('/unit', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('unit', { title: 'Unit Manager', manager: req.session.is_manager });
});

router.get('/user', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('user', { title: 'User Manager', manager: req.session.is_manager });
});

router.get('/tenant', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('tenant', { title: 'Tenant Manager', manager: req.session.is_manager });
});

module.exports = router;
