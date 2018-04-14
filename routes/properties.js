const db = require('../db');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  db.query('select * from property')
      .then(rs => {
        console.log(rs.rows);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs.rows));
      }).catch(e => {
        console.error(e.stack);
        res.send(e.stack);
      });
});

module.exports = router;
