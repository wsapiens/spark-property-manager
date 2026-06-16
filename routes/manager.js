const { Hono } = require('hono');
const pjson = require('../package.json');
const { csrfToken, renderLogin, renderView, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

function reactManagerLocals(c, title, reactPage, extra) {
  const user = requireUser(c);
  return Object.assign({
    title,
    manager: user ? user.is_manager : false,
    version: pjson.version,
    csrfToken: csrfToken(c),
    legacyUi: false,
    reactPage,
    reactBootstrap: Object.assign({
      manager: user ? user.is_manager : false,
      version: pjson.version,
      csrfToken: csrfToken(c),
      title
    }, extra || {})
  }, extra || {});
}

async function renderManagerView(c, view, title, reactPage, extra) {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  return renderView(c, view, reactManagerLocals(c, title, reactPage, extra));
}

router.get('/expense', async c => {
  return renderManagerView(c, 'expense', 'Expense', 'expense');
});

router.get('/import', async c => {
  return renderManagerView(c, 'import', 'Import Transactions', 'import', {
    message: '',
    error_message: ''
  });
});

router.get('/property', async c => {
  return renderManagerView(c, 'property', 'Property', 'property');
});

router.get('/unit', async c => {
  return renderManagerView(c, 'unit', 'Unit', 'unit');
});

router.get('/user', async c => {
  return renderManagerView(c, 'user', 'Login User', 'user');
});

router.get('/tenant', async c => {
  return renderManagerView(c, 'tenant', 'Tenant', 'tenant');
});

router.get('/work', async c => {
  return renderManagerView(c, 'work', 'Work Record', 'work');
});

router.get('/vendor', async c => {
  return renderManagerView(c, 'vendor', 'Vendor', 'vendor');
});

router.get('/payment', async c => {
  return renderManagerView(c, 'payment', 'Payment Method', 'payment');
});

module.exports = router;
