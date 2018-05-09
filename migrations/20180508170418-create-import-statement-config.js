'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('import_statement_config', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'company',
          key: 'id'
        }
      },
      filter_column_number: {
        type: Sequelize.INTEGER
      },
      filter_keyword: {
        type: Sequelize.STRING
      },
      date_column_number: {
        type: Sequelize.INTEGER
      },
      date_format: {
        type: Sequelize.STRING
      },
      pay_to_column_number: {
        type: Sequelize.INTEGER
      },
      amount_column_number: {
        type: Sequelize.INTEGER
      },
      category_column_number: {
        type: Sequelize.INTEGER
      },
      description_column_number: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('import_statement_config');
  }
};
