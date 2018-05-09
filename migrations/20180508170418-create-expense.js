'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('expense', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pay_to: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      pay_time: {
        type: Sequelize.DATE
      },
      file: {
        type: Sequelize.TEXT
      },
      unit_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'property_unit',
          key: 'id'
        }
      },
      type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'property_type',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('expense');
  }
};
