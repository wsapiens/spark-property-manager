const db = require('../db');
const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT u.id, u.property_id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building'
             + ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id '
             + ' WHERE p.company_id = $1',
             {
               bind: [ req.session.company_id ],
               type: models.sequelize.QueryTypes.SELECT
             })
        .then(units => {
          // log.debug(units);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": units}));
        });
});

router.get('/:unitId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('SELECT u.id, u.property_id, p.address_street, u.name, p.address_city, p.address_state, p.address_zip, u.is_building'
             + ' FROM property_unit AS u JOIN property AS p ON u.property_id = p.id'
             + ' WHERE u.id=$1',
             {
               bind: [ req.params.unitId ],
               type: models.sequelize.QueryTypes.SELECT
             })
        .then(units => {
          // log.debug(units);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(units[0]));
        });
});

router.post('/', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('INSERT INTO property_unit(property_id, name, is_building)'
           + ' VALUES ($1, $2, $3)',
            {
              bind: [
                req.body['property_id'],
                req.body['name'],
                req.body['is_building']
              ],
              type: models.sequelize.QueryTypes.INSERT
            })
        .then(function() {
          res.send();
        });
});

router.put('/:unitId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.sequelize
        .query('UPDATE property_unit SET property_id=$1, name=$2, is_building=$3'
             + ' WHERE id=$4',
             {
               bind: [
                 req.body['property_id'],
                 req.body['name'],
                 req.body['is_building'],
                 req.params.unitId
               ],
               type: models.sequelize.QueryTypes.UPDATE
             })
             .then(function() {
               res.send();
             });
});

router.delete('/:unitId', function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  models.PropertyUnit.destroy({
    where: {
      id: req.params.unitId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
