'use strict';

const fs        = require('fs');
const path      = require('path');
const config    = require('../config');
const Sequelize = require('sequelize');
var db        = {};
var basename  = path.basename(__filename);
var sequelize = new Sequelize(config.get('db.name'),
                                config.get('db.username'),
                                config.get('db.password'), {
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
    var model = sequelize['import'](path.join(__dirname, file));
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
