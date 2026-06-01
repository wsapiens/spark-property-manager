const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const { startExpiredSessionCleanup } = require('../lib/session-cleanup');

if (cluster.isMaster) {
  startExpiredSessionCleanup();

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  require('./server.js')();
}
