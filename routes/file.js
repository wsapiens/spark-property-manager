var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
  dest: __dirname + '../public/receipts/',
});

router.post('/receipt', upload.single('photo'), function(req, res, next) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  let pic = req.files.photo;

  // Use the mv() method to place the file somewhere on your server
  // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  if (err)
    return res.status(500).send(err);

  res.send('File uploaded!');
});

module.exports = router;
