'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
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

  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('property', 'memo');
    return queryInterface.removeColumn('property', 'loan_info');
  }
};
