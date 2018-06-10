const log = require('../log');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var router = express.Router();

router.get('/expense', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  console.log(req.csrfToken());
  res.render('expense', {
    title: 'Expense Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/import', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('import', {
    title: 'Import Manager',
    message: '',
    error_message: '',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/property', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('property', {
    title: 'Property Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
 });
});

router.get('/unit', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('unit', {
    title: 'Unit Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/user', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('user', {
    title: 'User Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/tenant', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('tenant', {
    title: 'Tenant Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/work', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('work', {
    title: 'Work Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

router.get('/vendor', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('vendor', {
    title: 'Vendor Manager',
    manager: req.user.is_manager,
    csrfToken: req.csrfToken()
  });
});

module.exports = router;
