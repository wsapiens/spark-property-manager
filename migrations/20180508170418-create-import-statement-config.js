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
      CompanyId: {
        type: Sequelize.INTEGER,
        references: { model: 'company', key: 'id' }
      },
      FilterColumnNumber: {
        type: Sequelize.INTEGER
      },
      FilterKeyword: {
        type: Sequelize.STRING
      },
      DateColumnNumber: {
        type: Sequelize.INTEGER
      },
      DateFormat: {
        type: Sequelize.STRING
      },
      PayToColumnNumber: {
        type: Sequelize.INTEGER
      },
      AmountColumnNumber: {
        type: Sequelize.INTEGER
      },
      CategoryColumnNumber: {
        type: Sequelize.INTEGER
      },
      DescriptionColumnNumber: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ImportStatementConfigs');
  }
};
