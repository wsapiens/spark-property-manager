# Native Hono Routes

Route modules should export a `Hono` instance and register native handlers:

```js
const { Hono } = require('hono');
const { empty, parseBody, renderLogin, requireUser } = require('../lib/hono-helpers');

const router = new Hono();

router.post('/', async c => {
  const user = requireUser(c);
  if (!user) {
    return renderLogin(c);
  }

  const body = await parseBody(c);
  await models.Example.create({
    name: body.name,
    company_id: user.company_id
  });

  return empty(c);
});

module.exports = router;
```

Native handlers should:

- use `async c => {}` instead of `(req, res, next)`;
- read route params with `c.req.param('id')`;
- read query strings through `getQuery(c)`;
- parse bodies with `await parseBody(c)`;
- access the authenticated user with `requireUser(c)` or `currentUser(c)`;
- await all Sequelize reads and writes before returning;
- return `c.json()`, `c.text()`, `c.redirect()`, `renderView()`, or `empty(c)` directly.
