const aes256 = require('aes256');
const randomstring = require("randomstring");
const fs = require('fs');

module.exports = {
  encrypt: function encrypt(plaintext) {
    var key = randomstring.generate(20);
    var encrypted = aes256.encrypt(key, plaintext);
    fs.writeFile('./.app.key', key, function(err) {
        if(err) {
          return console.log(err);
        }
    });
    return encrypted;
  },

  decrypt: function decrypt(encrypted) {
    var key = fs.readFileSync('./.app.key', 'utf8');
    return aes256.decrypt(key, encrypted);
  }
};
