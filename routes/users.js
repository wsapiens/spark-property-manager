const db = require('../db');
const log = require('../log');
const email = require('../email');
const config = require('../config')
const cryptoRandomString = require('crypto-random-string');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT id, email, firstname, lastname, phone, is_manager '
         + 'FROM login_user '
         + 'WHERE company_id = $1', [ req.session.company_id ])
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

router.get('/:userId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  db.query('SELECT * FROM login_user WHERE id=$1',[ req.params.userId ])
      .then(rs => {
        console.log(rs.rows[0]);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(rs.rows[0]));
      }).catch(e => {
        console.error(e.stack);
        log.error(e.stack);
        res.send(e.stack);
      });
});

router.post('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }

  var random_password = cryptoRandomString(5);
  var message	= {
   text:	'Your Account has been created with your email: '
          + req.body['email']
          + ' and temporary password: '
          + random_password
          + ', please change password after login ' + config.get('app.url'),
   from:	'SPARK PM <sparkrealestate@gmail.com>',
   to:		firstname + ' <' + req.body['email'] +'>',
   //cc:		"else <else@your-email.com>",
   subject:	'SPARK Property Manager App Account Creation',
   // attachment:
   // [
   //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
   // ]
};
  db.query('INSERT INTO login_user(email, password, firstname, lastname, phone, is_manager, company_id)'
           + ' VALUES ($1, crypt($2, gen_salt("bf")), $3, $4, $5, $6, $7)',
            [ req.body['email'],
              random_password,
              req.body['firstname'],
              req.body['lastname'],
              req.body['phone'],
              req.body['is_manager'],
              req.session.company_id ])
    .then(rs => {
      email.send(message, function(err, message) { log.info(err || message); });
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
})

router.put('/:userId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }

  var random_password = cryptoRandomString(5);
  var message	= {
   text:	'Your Account has been updated with your email: '
          + req.body['email']
          + ' and temporary password: '
          + random_password
          + ', please change password after login ' + config.get('app.url'),
   from:	'SPARK PM <sparkrealestate@gmail.com>',
   to:		req.body['firstname'] + ' <' + req.body['email'] +'>',
   //cc:		"else <else@your-email.com>",
   subject:	'SPARK Property Manager App Account Update',
   // attachment:
   // [
   //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
   // ]
};
  db.query("UPDATE login_user SET email=$1, password=crypt($2, gen_salt('bf')), firstname=$3, lastname=$4, phone=$5, is_manager=$6 WHERE id=$7",
          [ req.body['email'],
            random_password,
            req.body['firstname'],
            req.body['lastname'],
            req.body['phone'],
            req.body['is_manager'],
            req.params.userId ])
    .then(rs => {
      log.info('send email to ' + req.body['email']);
      email.send(message, function(err, message) { log.info(err || message); });
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

router.delete('/:userId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }

  db.query('DELETE FROM login_user WHERE id=$1',[ req.params.userId ])
    .then(rs => {
      res.send(rs);
    }).catch(e => {
      console.error(e.stack);
      log.error(e.stack);
      res.send(e.stack);
    });
});

module.exports = router;
