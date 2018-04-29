var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ipfilter = require('express-ipfilter').IpFilter;
const log = require('./log');

var indexRouter = require('./routes/index');
var managerRouter = require('./routes/manager');
var expensesRouter = require('./routes/expenses');
var typesRouter = require('./routes/types');
var propertiesRouter = require('./routes/properties');
var unitsRouter = require('./routes/units');
var fileRouter = require('./routes/file');
var userRouter = require('./routes/users');

var app = express();

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
  secret: 's3C537',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // change this to true when run as https
}));

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
