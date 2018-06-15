const log = require('../log');
const email = require('../email');
const models = require('../models');
const config = require('../config');
const cryptoRandomString = require('crypto-random-string')
var express = require('express');
var passport = require('passport');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: req.flash('errorMessage') });
  }
  res.render('index', { manager: req.user.is_manager, message: ''});
});

router.get('/login', function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('request-ip: ' + ip);
  log.info('login-ip: ' + ip);
  res.render('login', { message: req.flash('errorMessage') });
});

router.post('/login',
            passport.authenticate('local', { failureRedirect: '/login'}),
            function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log('request-ip: ' + ip);
  log.info('request-ip: ' + ip);
  var hour = 3600000;
  req.session.cookie.expires = new Date(Date.now() + hour);
  req.session.cookie.maxAge = hour;
  res.redirect(301, '/');
});

router.get('/password', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  res.render('index', {  manager: req.user.is_manager, message: ''});
});

router.post('/password', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .transaction(function (t) {
    models.sequelize
          .query('SELECT * FROM login_user WHERE id=$1 AND password = crypt($2, password)',
          {
            bind: [
              req.user.id,
              req.body.old_pass
            ],
            type: models.sequelize.QueryTypes.SELECT
          }, {transaction: t}).then(users => {
            if(users.length > 0) {
              console.log('old password is verified');
              log.debug('old password is verified');
              models.sequelize
                    .query("UPDATE login_user SET password = crypt($2, gen_salt('bf')) WHERE id=$1",
                    {
                      bind: [
                        req.user.id,
                        req.body.new_pass
                      ],
                      type: models.sequelize.QueryTypes.UPDATE
                    }, {transaction: t})
                    .then(function() {
                      log.info('password has been changed for user id: ' + req.user.id);
                    });
            return res.render('index', { manager: req.user.is_manager, message: ''});
        }
        console.log('old password verification fail for user id: ' + req.user.id);
        log.info('old password verification fail for user id: ' + req.user.id);
        res.render('index', { manager: req.user.is_manager, message: 'password change failed'});
      });
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
        req.logout();
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
  models.sequelize
        .transaction(function (t) {
          models.User.find({
            where: {
              email: req.body.email
            }
          }, {transaction: null }).then(user => {
            if(user) {
              return res.render('subscribe', { message: '', error_message: 'The email is already registered!'});
            }
            models.Company
                  .create({
                    name: req.body.email
                  }).then(company => {
                    var company_id = company.id;
                    var random_password = cryptoRandomString(5);
                    var message	= {
                      text:	'Your Account has been created with your email: '
                            + req.body.email
                            + ' and temporary password: '
                            + random_password
                            + ', please change password after login ' + config.get('app.url'),
                            from:	'SPARK REM <' + config.get('smtp.username') + '>',
                            to:		' <' + req.body.email +'>',
                            //cc:		"else <else@your-email.com>",
                            subject:	'SPARK Property Manager APP Account Creation',
                            // attachment:
                            // [
                            //    {data:"<html>i <i>hope</i> this works!</html>", alternative:true},
                            //    {path:"path/to/file.zip", type:"application/zip", name:"renamed.zip"}
                            // ]
                          };
                    models.sequelize
                          .query("INSERT INTO login_user (email, password, is_manager, company_id) VALUES ($1, crypt($2, gen_salt('bf')), $3, $4)",
                          {
                            bind: [
                              req.body.email,
                              random_password,
                              true,
                              company_id
                            ],
                            type: models.sequelize.QueryTypes.INSERT
                          })
                          .then(function() {
                            email.send(message, function(err, message) { log.info(err || message); });
                            res.render('subscribe', { message: 'Account has been created and password sent to your email', error_message: ''});
                          });
                  });
          });
        });
});

module.exports = router;
