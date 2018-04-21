const db = require('../db');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.redirect('/login')
  }
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/auth', function(req, res, next) {
  console.log(req.body.username);
  console.log(req.body.password);
  db.query('SELECT id, company_id, email, firstname, phone, is_admin, is_manager FROM login_user WHERE email=$1 AND password = crypt($2, password)', [req.body.username, req.body.password])
    .then(rs => {
      if(rs.rows.length > 0) {
        req.session.user_id  = rs.rows[0]['id'];
        req.session.company_id = rs.rows[0]['company_id'];
        req.session.firstname = rs.rows[0]['firstname'];
        return res.redirect('/');
      }
      res.render('index', { error_message: 'Authentication Fail123' });
    }).catch(e => {
      console.error(e.stack);
      res.send(e.stack);
    });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;
