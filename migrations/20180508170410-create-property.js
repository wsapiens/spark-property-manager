'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('property', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address_street: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address_city: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address_state: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address_zip: {
        allowNull: false,
        type: Sequelize.STRING
      },
      index_number: {
        type: Sequelize.STRING
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'company',
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
    return queryInterface.dropTable('property');
  }
};
