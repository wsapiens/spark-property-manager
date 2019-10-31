'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.addColumn(
      'work_order',
      'vendor_id',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'vendor',
          key: 'id'
        }
      }
    );
    queryInterface.removeColumn('work_order', 'assignee_name');
    queryInterface.removeColumn('work_order', 'assignee_phone');
    return queryInterface.removeColumn('work_order', 'assignee_email');
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.removeColumn('work_order', 'vendor_id');
    queryInterface.addColumn(
      'work_order',
      'assignee_name',
      {
        type: Sequelize.TEXT
      }
    );
    queryInterface.addColumn(
      'work_order',
      'assignee_phone',
      {
        type: Sequelize.TEXT
      }
    );
    return queryInterface.addColumn(
      'work_order',
      'assignee_email',
      {
        type: Sequelize.TEXT
      }
    );
  }
};
