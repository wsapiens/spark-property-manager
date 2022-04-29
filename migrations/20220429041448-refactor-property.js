'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'property',
      'loan_info',
      {
        type: Sequelize.TEXT
      }
    );
    return queryInterface.addColumn(
      'property',
      'memo',
      {
        type: Sequelize.TEXT
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('property', 'memo');
    return queryInterface.removeColumn('property', 'loan_info');
  }
};
