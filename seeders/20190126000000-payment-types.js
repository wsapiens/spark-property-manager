'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('payment_type', [
      { name: 'Cash' },
      { name: 'Check' },
      { name: 'Credit' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('payment_type', null, {});

  }
};
