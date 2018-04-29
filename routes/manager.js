const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('expense', { title: 'Expense Manager' });
});

router.get('/property', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('property', { title: 'Property Manager' });
});

router.get('/unit', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('unit', { title: 'Unit Manager' });
});

module.exports = router;
