'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
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
    return;
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('expense', 'method_id');
    return;
  }
};
