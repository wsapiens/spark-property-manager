'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'expense',
      'method_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'payment_method',
          key: 'id'
        }
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('expense', 'method_id');
  }
};
