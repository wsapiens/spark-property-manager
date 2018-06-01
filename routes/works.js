const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.WorkOrder
        .findAll({
          where: {
            company_id: req.user.company_id
          },
          include: [{
              model: models.PropertyUnit,
              include: [{
                model: models.Property
              }]
          }]
        }).then(works => {
          log.debug(works);
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify({"data": works}));
        });
});

router.get('/:workId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.WorkOrder
        .findById(req.params.workId)
        .then(work =>{
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(work));
        });
});

router.post('/', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var startDate = new Date();
  if(req.body['start_date']) {
    startDate = req.body['start_date'];
  }
  var endDate = new Date();
  if(req.body['end_date']) {
    endDate = req.body['end_date'];
  }
  models.WorkOrder.create({
    unit_id: req.body['unit_id'],
    description: req.body['description'],
    status: req.body['status'],
    estimation: req.body['estimation'],
    scheduled_date: new Date(),
    start_date: startDate,
    end_date: endDate,
    assignee_name: req.body['assignee_name'],
    assignee_phone: req.body['assignee_phone'],
    assignee_email: req.body['assignee_email'],
    company_id: req.user.company_id
  }).then(work => {
    res.send(work);
  });
});

router.put('/:workId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var startDate = new Date();
  if(req.body['start_date']) {
    startDate = req.body['start_date'];
  }
  var endDate = new Date();
  if(req.body['end_date']) {
    endDate = req.body['end_date'];
  }
  models.WorkOrder
        .findById(req.params.workId)
        .then(work => {
          if(work) {
            work.updateAttributes({
              unit_id: req.body['unit_id'],
              description: req.body['description'],
              status: req.body['status'],
              estimation: req.body['estimation'],
              //scheduled_date: req.body['scheduled_date'],
              start_date: startDate,
              end_date: endDate,
              assignee_name: req.body['assignee_name'],
              assignee_phone: req.body['assignee_phone'],
              assignee_email: req.body['assignee_email']
            });
          }
        });
  res.send();
});

router.delete('/:workId', function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  models.WorkOrder.destroy({
    where: {
      id: req.params.workId
    }
  }).then(function() {
    res.send();
  });
});

module.exports = router;
