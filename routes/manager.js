const log = require('../log');
const pjson = require('../package.json');
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
    title: 'Expense',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/import', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('import', {
    title: 'Import Transactions',
    message: '',
    error_message: '',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/property', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('property', {
    title: 'Property',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
 });
});

router.get('/unit', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('unit', {
    title: 'Unit',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/user', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('user', {
    title: 'Login User',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/tenant', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('tenant', {
    title: 'Tenant',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/work', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('work', {
    title: 'Work Record',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/vendor', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('vendor', {
    title: 'Vendor',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

router.get('/payment', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('payment', {
    title: 'Payment Method',
    manager: req.user.is_manager,
    version: pjson.version,
    csrfToken: req.csrfToken()
  });
});

module.exports = router;
