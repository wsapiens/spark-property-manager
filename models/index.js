'use strict';

const fs        = require('fs');
const path      = require('path');
const config    = require('../config');
const crypto    = require('../util/crypto');
const log       = require('../log');
const Sequelize = require('sequelize');
const cls = require('continuation-local-storage');
var namespace = cls.createNamespace('spark-property-manager-namespace');
Sequelize.useCLS(namespace);
const encrypt_prefix = "[encrypt]";

var db        = {};
var basename  = path.basename(__filename);

function decrypt(password) {
  if('null' != password && typeof password === "string" && password.startsWith(encrypt_prefix)) {
    log.info('decrypt password');
    password = crypto.decrypt(password.replace(encrypt_prefix, ''));
  }
  return password;
}

var sequelize = new Sequelize(config.get('db.name'),
                              config.get('db.username'),
                              decrypt(config.get('db.password')), {
  host: config.get('db.hostname'),
  dialect: config.get('db.dialect'),

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  //storage: 'path/to/database.sqlite',

  // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operatorsAliases: false
});

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
