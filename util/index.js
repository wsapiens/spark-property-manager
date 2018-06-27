module.exports = {
  getImportAmount: function getImportAmount(amount, filter) {
    // return
    if(filter.match(/return/i) && 0 < amount) {
        return -1.0 * amount;
    }

    // sale
    if( !filter.match(/return/i) && 0 > amount) {
      return -1.0 * amount;
    }
    return amount;
  },

  getImportDescription: function getImportDescription(description, filter) {
    if(filter.match(/return/i)) {
      return description + '<mark>[Return]</mark>';
    }
    return description;
  },

  getRandomRGB: function getRandomRGB() {
    return ["rgb(" + Math.floor(Math.random() * 255),
              Math.floor(Math.random() * 255),
              Math.floor(Math.random() * 255) + ")"].join(",");
  }
};
