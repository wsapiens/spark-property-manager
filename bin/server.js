#!/usr/bin/env node

/**
 * Module dependencies.
 */
var fs = require('fs');
var config = require('../config');
var app = require('../app');
var debug = require('debug')('spark-property-manager:server');
var http = require('http');
var https = require('https');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || config.get('app.port'));
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);
if(config.get('app.https')) {
  server = https.createServer({
    key: fs.readFileSync(config.get('app.serverkey')),
    cert: fs.readFileSync(config.get('app.servercert'))
  }, app);
}

/**
 * Listen on provided port, on all network interfaces.
 */
function startServer() {
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
}

if(!module.parent) {
  // Start server if file is run directly
  startServer();
} else {
  // Export server, if file is referenced via cluster
  module.exports = startServer;
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
