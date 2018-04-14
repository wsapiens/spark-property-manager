var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  res.render('expense', { title: 'Expense Manager' });
});

module.exports = router;
