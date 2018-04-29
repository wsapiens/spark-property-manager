const db = require('../db');
const log = require('../log');
var express = require('express');
var router = express.Router();

router.get('/expense', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT * FROM expense_type')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        log.error(e.stack);
        res.send(e.stack);
      });
});

router.get('/property', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT * FROM property_type')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({"data": rs.rows}));
      }).catch(e => {
        console.error(e.stack);
        log.error(e.stack);
        res.send(e.stack);
      });
});

module.exports = router;
