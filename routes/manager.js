const { Hono } = require('hono');
const pjson = require('../package.json');
const { csrfToken, renderLogin, renderView, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

function managerLocals(c, title, extra) {
  const user = requireUser(c);
  return Object.assign({
    title: title,
    manager: user.is_manager,
    version: pjson.version,
    csrfToken: csrfToken(c)
  }, extra || {});
}

async function renderManagerView(c, view, title, extra) {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  return renderView(c, view, managerLocals(c, title, extra));
}

router.get('/expense', async c => {
  console.log(csrfToken(c));
  return renderManagerView(c, 'expense', 'Expense');
});

router.get('/import', c => {
  return renderManagerView(c, 'import', 'Import Transactions', {
    message: '',
    error_message: ''
  });
});

router.get('/property', c => {
  return renderManagerView(c, 'property', 'Property');
});

router.get('/unit', c => {
  return renderManagerView(c, 'unit', 'Unit');
});

router.get('/user', c => {
  return renderManagerView(c, 'user', 'Login User');
});

router.get('/tenant', c => {
  return renderManagerView(c, 'tenant', 'Tenant');
});

router.get('/work', c => {
  return renderManagerView(c, 'work', 'Work Record');
});

router.get('/vendor', c => {
  return renderManagerView(c, 'vendor', 'Vendor');
});

router.get('/payment', c => {
  return renderManagerView(c, 'payment', 'Payment Method');
});

module.exports = router;
