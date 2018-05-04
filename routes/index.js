const db = require('../db');
const log = require('../log');
const email = require('../email');
const config = require('../config');
const cryptoRandomString = require('crypto-random-string')
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('index', { manager: req.session.is_manager, message: ''});
});

router.get('/login', function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('request-ip: ' + ip);
  log.info('login-ip: ' + ip);
  var hour = 3600000
  req.session.cookie.expires = new Date(Date.now() + hour)
  req.session.cookie.maxAge = hour
  res.render('login', { message: '' });
});

router.post('/login', function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('request-ip: ' + ip);
  log.info('request-ip: ' + ip);
  if(!(req.body.username && req.body.password)) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT id, company_id, email, firstname, phone, is_admin, is_manager FROM login_user WHERE email=$1 AND password = crypt($2, password)', [req.body.username, req.body.password])
    .then(rs => {
      if(rs.rows.length > 0) {
        req.session.user_id  = rs.rows[0]['id'];
        req.session.is_manager = rs.rows[0]['is_manager'];
        req.session.company_id = rs.rows[0]['company_id'];
        req.session.firstname = rs.rows[0]['firstname'];
        return res.render('index', { manager: req.session.is_manager, message: ''});
      }
      // res.redirect('/login');
      res.render('login', { message: 'Invalid Username or Password!' });
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.get('/password', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  res.render('index', {  manager: req.session.is_manager, message: ''});
});

router.post('/password', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT * FROM login_user WHERE id=$1 AND password = crypt($2, password)', [req.session.user_id, req.body.old_pass])
    .then(rs => {
      if(rs.rows.length > 0) {
        console.log('old password is verified');
        log.debug('old password is verified');
        db.query("UPDATE login_user SET password = crypt($2, gen_salt('bf')) WHERE id=$1", [req.session.user_id, req.body.new_pass])
          .then(rs => {
              if(rs.rows.length > 0) {
                log.info('password has been changed for user id: ' + req.session.user_id);
              }
          }).catch(e => {
            console.error(e.stack);
            log.error(e.stack);
            res.send(e.stack);
          });
          return res.render('index', { manager: req.session.is_manager, message: ''});
      }
      console.log('old password verification fail for user id: ' + req.session.user_id);
      log.info('old password verification fail for user id: ' + req.session.user_id);
      res.render('index', { manager: req.session.is_manager, message: 'password change failed'});
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        log.error(err);
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/subscribe', function(req, res, next) {
  res.render('subscribe', { message: '', error_message: ''});
});

router.post('/subscribe', function(req, res, next) {
  if(!req.body.email) {
    return res.render('subscribe', { message: '', error_message: 'email address is missing!'});
  }

  db.query('SELECT * FROM login_user WHERE email=$1', [req.body.email])
    .then(rs => {
      if(rs.rows.length >0) {
        return res.render('subscribe', { message: '', error_message: 'The email is already registered!'});
      }
    }).catch(e => { // if error for checking email
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });

  db.query('INSERT INTO company (name) VALUES ($1) RETURNING id', [req.body.email])
    .then(rs => {
      var company_id = rs.rows[0]['id'];
      var random_password = cryptoRandomString(5);
      var message	= {
            text:	'Your Account has been created with your email: '
                + req.body.email
                + ' and temporary password: '
                + random_password
                + ', please change password after login ' + config.get('app.url'),
                from:	'SPARK PM <' + config.get('smtp.username') + '>',
                to:		' <' + req.body.email +'>',
                //cc:		"else <else@your-email.com>",
                subject:	'SPARK Property Manager App Account Creation',
                // attachment:
                // [
                //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
                //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
                // ]
          };
        if(!company_id || company_id < 1) {
          return res.render('subscribe', { message: '', error_message: 'Account Creation Fail!'});
        }

        db.query("INSERT INTO login_user (email, password, is_manager, company_id) VALUES ($1, crypt($2, gen_salt('bf')), $3, $4)",
                  [ req.body.email,
                    random_password,
                    true,
                    company_id ])
          .then(rs => {
            email.send(message, function(err, message) { log.info(err || message); });
          }).catch(e => { // if error for creating user
            console.error(e.stack);
            log.error(e.stack);
            res.send(e.stack);
          });

    }).catch(e => { // if error for creating company
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });

    return res.render('subscribe', { message: 'account has been created', error_message: ''});
});

module.exports = router;
