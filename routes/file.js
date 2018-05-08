const log = require('../log');
const models = require('../models');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, req.session.company_id
              + '-'
              + file.fieldname
              + '-'
              + Date.now()
              + '-'
              + file.originalname)
  }
})
var upload = multer({ storage: storage });

router.post('/receipt', upload.single('receipt'), function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
  console.log(req.file.filename);
  console.log(req.file.originalname);
  res.send(req.file.filename);
});

router.post('/statement', upload.single('statement'), function(req, res, next) {
  if(!req.session.user_id) {
    return res.render('login', { message: '' });
  }
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }
});
module.exports = router;
