var createError = require('http-errors');
var express = require('express');
var eaa = require('express-async-await');
var session = require('express-session');
var memcachedStore = require('connect-memcached')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var flash    = require('connect-flash');
var ipfilter = require('express-ipfilter').IpFilter;
const LocalStrategy = require('passport-local').Strategy;
const log = require('./log');
const models = require('./models');
const config = require('./config');

var indexRouter = require('./routes/index');
var managerRouter = require('./routes/manager');
var expensesRouter = require('./routes/expenses');
var typesRouter = require('./routes/types');
var propertiesRouter = require('./routes/properties');
var unitsRouter = require('./routes/units');
var fileRouter = require('./routes/file');
var userRouter = require('./routes/users');
var tenantRouter = require('./routes/tenants');
var importRouter = require('./routes/import');
var workRouter = require('./routes/works');
var vendorRouter = require('./routes/vendors');
var paymentRouter = require('./routes/payments');

var app = eaa(express());

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.session
        && req.session.passport
        && req.session.passport.user) {
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/login');
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// trust first proxy
app.set('trust proxy', 1);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  express.static(path.join(__dirname, 'node_modules')),
  express.static(path.join(__dirname, 'public'))
);
app.use(session({
  secret: config.get('app.sessionSecret'),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // change this to true when run as https
  store: new memcachedStore({
    hosts: [ config.get('app.memcachedHost') ],
    secret: config.get('app.memcachedSecret'), // Optionally use transparent encryption for memcache session data
  })
}));
// uploads static should be after setting session
app.use('/uploads', isLoggedIn, express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  models.User
        .findById(id)
        .then(user => {
          cb(null, user);
        });
});


passport.use(new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) {
    models.sequelize
          .query('SELECT id, company_id, email, firstname, phone, is_admin, is_manager FROM login_user WHERE email=$1 AND password = crypt($2, password)',
          {
            bind: [
              username,
              password
            ],
            type: models.sequelize.QueryTypes.SELECT
          })
          .then(users => {
            if(users.length > 0) {
              return done(null, users[0]);
            } else {
              return done(null, false, req.flash('errorMessage', 'Login Failure'));
            }
          });
  }
));


// IP list to block or allow
var ips = [];
app.use(ipfilter(ips));
// app.use(ipfilter(ips, {mode: 'allow'}));

app.use('/', indexRouter);
app.use('/manager', managerRouter);
app.use('/expenses', expensesRouter);
app.use('/types', typesRouter);
app.use('/properties', propertiesRouter);
app.use('/units', unitsRouter);
app.use('/file', fileRouter);
app.use('/users', userRouter);
app.use('/tenants', tenantRouter);
app.use('/import', importRouter);
app.use('/works', workRouter);
app.use('/vendors', vendorRouter);
app.use('/payments', paymentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  log.error(err.message);
  log.error(err.stack);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
