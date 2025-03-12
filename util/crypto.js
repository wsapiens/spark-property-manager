const aes256 = require('aes256');
const fs = require('fs');
const path = require('path');
const crypto = require('node:crypto');

function generateRandomString(length) {
  return crypto.randomBytes(length / 2).toString('hex');
}

module.exports = {
  generateRandomString: generateRandomString,

  encrypt: function encrypt(plaintext) {
    var key = generateRandomString(20);
    var encrypted = aes256.encrypt(key, plaintext);
    // process.stdout.write(key);
    fs.writeFileSync(path.resolve(__dirname, '../.app.key'), key, 'utf8');
    return encrypted;
  },

  decrypt: function decrypt(encrypted) {
    var key=fs.readFileSync(path.resolve(__dirname, '../.app.key'), 'utf8');
    // process.stdout.write(key);
    return aes256.decrypt(key, encrypted);
  }
};
