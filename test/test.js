var assert = require('assert');
var util = require('../util');

describe('util', function() {
  describe('getImportAmount()', function() {
    it('get negative amount for positive return amount', function() {
      assert.equal(util.getImportAmount(15.33, 'Return'), -15.33);
    });
    it('get negative amount for negative return amount ', function() {
      assert.equal(util.getImportAmount(-25.33, 'Return'), -25.33);
    });
    it('get postive amount for positive sale amount', function() {
      assert.equal(util.getImportAmount(15.33, 'Sale'), 15.33);
    });
    it('get positive amount for negative sale amount ', function() {
      assert.equal(util.getImportAmount(-25.33, 'Sale'), 25.33);
    });
  });

  describe('getImportDescription()', function() {
    it('get description with return mark', function() {
      assert.equal(util.getImportDescription('description', 'Return'), 'description<mark>[Return]</mark>');
    });
    it('get description without return mark ', function() {
      assert.equal(util.getImportDescription('description', 'Sale'), 'description');
    });
  });

  describe('getRandomRGB()', function() {
    it('get RGB string', function() {
      assert(util.getRandomRGB().match('[rgb(]{1}[0-9]+[,]{1}[0-9]+[,]{1}[0-9]+[)]{1}'), 'it should be rgb([number],[number],[number])');
    });
  });
});
