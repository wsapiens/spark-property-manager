const { Hono } = require('hono');
const {
  csrfMiddleware,
  ipFilter,
  logger,
  notFound,
  onError,
  rateLimiter,
  requireLogin,
  sessionMiddleware,
  staticFiles
} = require('./lib/hono-compat');

const indexRouter = require('./routes/index');
const managerRouter = require('./routes/manager');
const expensesRouter = require('./routes/expenses');
const typesRouter = require('./routes/types');
const propertiesRouter = require('./routes/properties');
const unitsRouter = require('./routes/units');
const fileRouter = require('./routes/file');
const userRouter = require('./routes/users');
const tenantRouter = require('./routes/tenants');
const importRouter = require('./routes/import');
const workRouter = require('./routes/works');
const vendorRouter = require('./routes/vendors');
const paymentRouter = require('./routes/payments');

const app = new Hono();
const settings = {};

app.set = function(key, value) {
  settings[key] = value;
};

app.getSetting = function(key) {
  return settings[key];
};

app.use('*', logger());
app.use('/api/*', rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
app.use('*', sessionMiddleware());
app.use('*', csrfMiddleware());
app.use('*', staticFiles('node_modules'));
app.use('*', staticFiles('public'));
app.use('/uploads/*', requireLogin(), staticFiles('uploads', { prefix: '/uploads' }));
app.use('*', ipFilter([]));

app.route('/', indexRouter);
app.route('/manager', managerRouter);
app.route('/expenses', expensesRouter);
app.route('/types', typesRouter);
app.route('/properties', propertiesRouter);
app.route('/units', unitsRouter);
app.route('/file', fileRouter);
app.route('/users', userRouter);
app.route('/tenants', tenantRouter);
app.route('/import', importRouter);
app.route('/works', workRouter);
app.route('/vendors', vendorRouter);
app.route('/payments', paymentRouter);

app.notFound(notFound());
app.onError(onError);

module.exports = app;
