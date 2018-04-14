const config = require('../config');
const { Pool, Client } = require('pg');
const pool = new Pool({
   host: config.get('db.hostname'),
   port: Number(config.get('db.port')),
   database: config.get('db.name'),
   user: config.get('db.username'),
   password: config.get('db.password'),
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback)
  }
}
