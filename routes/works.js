const log = require('../log');
const models = require('../models');
var express = require('express');
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
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
            },{
              model: models.Vendor
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
        .findOne({
          where: {
            id: req.params.workId
          },
          include: [{
            model: models.Vendor
          }]
        }).then(work =>{
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(work));
        });
});

router.post('/', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var startDate = new Date();
  if(req.body.start_date) {
    startDate = req.body.start_date;
  }
  var endDate = new Date();
  if(req.body.end_date) {
    endDate = req.body.end_date;
  }
  if(!req.body.vendor_id && req.body.vendor_name) {
    models.Vendor.create({
      name: req.body.vendor_name,
      phone: req.body.vendor_phone,
      email: req.body.vendor_email,
      company_id: req.user.company_id
    }).then(vendor => {
      models.WorkOrder.create({
        unit_id: req.body.unit_id,
        description: req.body.description,
        status: req.body.status,
        estimation: req.body.estimation,
        scheduled_date: new Date(),
        start_date: startDate,
        end_date: endDate,
        vendor_id: vendor.id,
        company_id: req.user.company_id
      }).then(work => {
        res.send(work);
      });
    });
  } else {
    models.WorkOrder.create({
      unit_id: req.body.unit_id,
      description: req.body.description,
      status: req.body.status,
      estimation: req.body.estimation,
      scheduled_date: new Date(),
      start_date: startDate,
      end_date: endDate,
      vendor_id: req.body.vendor_id,
      company_id: req.user.company_id
    }).then(work => {
      res.send(work);
    });
  }
});

router.put('/:workId', csrfProtection, function(req, res, next) {
  if(!req.isAuthenticated()) {
    return res.render('login', { message: '' });
  }
  var startDate = new Date();
  if(req.body.start_date) {
    startDate = req.body.start_date;
  }
  var endDate = new Date();
  if(req.body.end_date) {
    endDate = req.body.end_date;
  }
  if(!req.body.vendor_id && req.body.vendor_name) {
    models.Vendor.create({
      name: req.body.vendor_name,
      phone: req.body.vendor_phone,
      email: req.body.vendor_email,
      company_id: req.user.company_id
    }).then(vendor => {
      models.WorkOrder
            .findById(req.params.workId)
            .then(work => {
              if(work) {
                work.updateAttributes({
                  unit_id: req.body.unit_id,
                  description: req.body.description,
                  status: req.body.status,
                  estimation: req.body.estimation,
                  //scheduled_date: req.body['scheduled_date'],
                  start_date: startDate,
                  end_date: endDate,
                  vendor_id: vendor.id
                });
              }
            });
    });
  } else {
    models.WorkOrder
          .findById(req.params.workId)
          .then(work => {
            if(work) {
              work.updateAttributes({
                unit_id: req.body.unit_id,
                description: req.body.description,
                status: req.body.status,
                estimation: req.body.estimation,
                //scheduled_date: req.body['scheduled_date'],
                start_date: startDate,
                end_date: endDate,
                vendor_id: req.body.vendor_id
              });
            }
          });
  }
  res.send();
});

router.delete('/:workId', csrfProtection, function(req, res, next) {
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
