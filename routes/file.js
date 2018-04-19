var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: __dirname + './public/uploads/' });

router.post('/receipt', upload.single('receipt'), function(req, res, next) {
  console.log('>>>>>>> ' + req.file);
  console.log('>>>>>>> ' + req.files);

  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  let pic = req.files.reciept;

  // Use the mv() method to place the file somewhere on your server
  // sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
  if (err)
    return res.status(500).send(err);

  res.send('File uploaded!');
});

module.exports = router;
