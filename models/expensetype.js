'use strict';
module.exports = (sequelize, DataTypes) => {
  var ExpenseType = sequelize.define('ExpenseType', {
    name: { type: DataTypes.STRING, allowNull: false }
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
    tableName: 'expense_type'
  });

  ExpenseType.associate = function(models) {
    models.ExpenseType.hasMany(models.Expense, { foreignKey: 'type_id' });
  };

  return ExpenseType;
};
