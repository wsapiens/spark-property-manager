'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'expense',
      'source_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'payment_source',
          key: 'id'
        }
      }
    );
    return;
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('expense', 'source_id');
    return;
  }
};
