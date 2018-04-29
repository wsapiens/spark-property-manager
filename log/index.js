const config = require('../config');
const log4js = require('log4js');
log4js.configure({
  appenders: { app: { type: 'file', filename: config.get('log.file') } },
  categories: { default: { appenders: ['app'], level: config.get('log.level') } }
});

const logger = log4js.getLogger('app');

module.exports = logger;
