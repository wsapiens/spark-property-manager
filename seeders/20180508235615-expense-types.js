'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('expense_type', [
      { name: 'Advertising' },
      { name: 'Auto and Travel' },
      { name: 'Cleaning and Maintenance' },
      { name: 'Commissions' },
      { name: 'Insurance' },
      { name: 'Legal and other professional fees' },
      { name: 'Management fees' },
      { name: 'Mortgate interest paid to banks, etc' },
      { name: 'Others' },
      { name: 'Repairs' },
      { name: 'Supplies' },
      { name: 'Taxes' },
      { name: 'Utilities' }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('expense_type', null, {});

  }
};
