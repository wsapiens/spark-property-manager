var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.session.user_id) {
    return res.redirect('/login')
  }
  res.render('expense', { title: 'Expense Manager' });
});

router.get('/property', function(req, res, next) {
  if(!req.session.user_id) {
    return res.redirect('/login')
  }
  res.render('property', { title: 'Property Manager' });
});

module.exports = router;
