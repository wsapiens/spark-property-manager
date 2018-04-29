const log = require('../log');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './public/uploads/' });

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

module.exports = router;
