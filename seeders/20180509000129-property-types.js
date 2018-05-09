'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('property_type', [
      { name: 'single' },
      { name: 'multi' },
      { name: 'condo' },
      { name: 'apartment' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('property_type', null, {});
  }
};
