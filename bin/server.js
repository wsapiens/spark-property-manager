#!/usr/bin/env node

const fs = require('fs');
const config = require('../config');
const app = require('../app');
const debug = require('debug')('spark-property-manager:server');

const port = normalizePort(process.env.PORT || config.get('app.port'));
app.set('port', port);

function startServer() {
  if (typeof globalThis.Bun === 'undefined') {
    throw new Error('The Hono runtime is configured for Bun. Start the app with `bun ./bin/server.js`.');
  }

  const serverOptions = {
    port,
    fetch: app.fetch
  };

  if (config.get('app.https')) {
    serverOptions.tls = {
      key: fs.readFileSync(config.get('app.serverkey')),
      cert: fs.readFileSync(config.get('app.servercert'))
    };
  }

  const server = globalThis.Bun.serve(serverOptions);
  onListening(server);
  return server;
}

if (!module.parent) {
  startServer();
} else {
  module.exports = startServer;
}

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

function onListening(server) {
  debug('Listening on port ' + server.port);
}
