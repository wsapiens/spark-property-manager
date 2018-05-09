'use strict';
module.exports = (sequelize, DataTypes) => {
  var ImportStatementConfig = sequelize.define('ImportStatementConfig', {
    filter_column_number: DataTypes.INTEGER,
    filter_keyword: DataTypes.STRING,
    date_column_number: DataTypes.INTEGER,
    date_format: DataTypes.STRING,
    pay_to_column_number: DataTypes.INTEGER,
    amount_column_number: DataTypes.INTEGER,
    category_column_number: DataTypes.INTEGER,
    description_column_number: DataTypes.INTEGER,
    company_id: {
      type: DataTypes.INTEGER,
      references: 'company', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    }
  },
  {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,
    // don't use camelcase for automatically added attributes but underscore style
    // so updatedAt will be updated_at
    underscored: true,
    // disable the modification of tablenames; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,
    tableName: 'import_statement_config'
  });
  ImportStatementConfig.associate = function(models) {
    models.ImportStatementConfig.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id'
    });
  };
  return ImportStatementConfig;
};
