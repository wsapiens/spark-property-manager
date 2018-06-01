'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('work_order', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.TEXT
      },
      estimation: {
        type: Sequelize.DECIMAL(10, 2)
      },
      scheduled_date: {
        type: Sequelize.DATE
      },
      start_date: {
        type: Sequelize.DATE
      },
      end_date: {
        type: Sequelize.DATE
      },
      assignee_name: {
        type: Sequelize.TEXT
      },
      assignee_phone: {
        type: Sequelize.TEXT
      },
      assignee_email: {
        type: Sequelize.TEXT
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'company',
          key: 'id'
        }
      },
      unit_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'property_unit',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('work_order');
  }
};
