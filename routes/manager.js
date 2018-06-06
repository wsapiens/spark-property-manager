const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('expense', { title: 'Expense Manager', manager: req.user.is_manager });
});

router.get('/import', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('import', {
                        title: 'Import Manager',
                        message: '',
                        error_message: '',
                        manager: req.user.is_manager
                      }
            );

});

router.get('/property', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('property', { title: 'Property Manager', manager: req.user.is_manager });
});

router.get('/unit', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('unit', { title: 'Unit Manager', manager: req.user.is_manager });
});

router.get('/user', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('user', { title: 'User Manager', manager: req.user.is_manager });
});

router.get('/tenant', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('tenant', { title: 'Tenant Manager', manager: req.user.is_manager });
});

router.get('/work', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('work', { title: 'Work Manager', manager: req.user.is_manager });
});

router.get('/vendor', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('vendor', { title: 'Vendor Manager', manager: req.user.is_manager });
});

module.exports = router;
