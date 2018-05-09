'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('property_unit', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      is_building: {
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      property_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'property',
          key: 'id'
        }
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('property_unit');
  }
};
