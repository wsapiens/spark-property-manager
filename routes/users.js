const log = require('../log');
const email = require('../email');
const models = require('../models');
const config = require('../config');
const cryptoRandomString = require('crypto-random-string');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.User.findAll({
    where: {
      company_id: req.user.company_id
    }
  }).then(users => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({"data": users}));
  });
});

router.get('/:userId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.User.find({
    where: {
      id: req.params.userId
    }
  }).then(user => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(user));
  });
});

router.post('/', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var random_password = cryptoRandomString(5);
  var message	= {
   text:	'Your Account has been created with your email: '
          + req.body.email
          + ' and temporary password: '
          + random_password
          + ', please change password after login ' + config.get('app.url'),
   from:	'SPARK REM <' + config.get('smtp.username') + '>',
   to:		req.body.firstname + ' <' + req.body.email +'>',
   //cc:		"else <else@your-email.com>",
   subject:	'SPARK Property Manager App Account Creation',
   // attachment:
   // [
   //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
   // ]
  };
  models.sequelize
        .query("INSERT INTO login_user(email, password, firstname, lastname, phone, is_manager, company_id)"
             + " VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6, $7)",
            { bind: [
                req.body.email,
                random_password,
                req.body.firstname,
                req.body.lastname,
                req.body.phone,
                req.body.is_manager,
                req.user.company_id
              ],
              type: models.sequelize.QueryTypes.INSERT
            })
    .then(function() {
      email.send(message, function(err, message) { log.info(err || message); });
      res.send();
    });
});

router.put('/:userId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var random_password = cryptoRandomString(5);
  var message	= {
   text:	'Your Account has been updated with your email: '
          + req.body.email
          + ' and temporary password: '
          + random_password
          + ', please change password after login ' + config.get('app.url'),
   from:	'SPARK PM <' + config.get('smtp.username') + '>',
   to:		req.body.firstname + ' <' + req.body.email +'>',
   //cc:		"else <else@your-email.com>",
   subject:	'SPARK Property Manager App Account Update',
   // attachment:
   // [
   //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
   //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
   // ]
  };
  models.sequelize
        .query("UPDATE login_user SET email=$1, password=crypt($2, gen_salt('bf')), firstname=$3, lastname=$4, phone=$5, is_manager=$6 WHERE id=$7",
          {
            bind: [
              req.body.email,
              random_password,
              req.body.firstname,
              req.body.lastname,
              req.body.phone,
              req.body.is_manager,
              req.params.userId
            ],
            type: models.sequelize.QueryTypes.UPDATE
          })
    .then(function() {
      log.info('send email to ' + req.body.email);
      email.send(message, function(err, message) { log.info(err || message); });
      res.send();
    });
});

router.delete('/:userId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.User.destroy({
    where: {
      id: req.params.userId
    }
  }).then(function(){
    res.send();
  });
});

module.exports = router;
