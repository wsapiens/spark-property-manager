const config = require('../config');
const email 	= require("../node_modules/emailjs/email");
const server 	= email.server.connect({
   user: config.get('smtp.username'),
   password: config.get('smtp.password'),
   host: config.get('smtp.hostname'),
   port: config.get('smtp.port'),
   ssl: config.get('smtp.ssl'),
   tls: config.get('smtp.tls')
});

module.exports = server;
