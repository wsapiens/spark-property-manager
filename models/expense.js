'use strict';
module.exports = (sequelize, DataTypes) => {
  var Expense = sequelize.define('Expense', {
    pay_to: DataTypes.STRING,
    description: DataTypes.TEXT,
    amount: DataTypes.DECIMAL(10, 2),
    pay_time: DataTypes.DATE,
    file: DataTypes.TEXT,
    unit_id: {
      type: DataTypes.INTEGER,
      references: 'property_unit', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    },
    type_id: {
      type: DataTypes.INTEGER,
      references: 'expense_type', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    },
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
    tableName: 'expense'
  });

  Expense.associate = function (models) {
    models.Expense.belongsTo(models.PropertyUnit, {
      onDelete: 'CASCADE',
      foreignKey: 'unit_id',
      targetKey: 'id'
    });

    models.Expense.belongsTo(models.ExpenseType, {
      onDelete: 'CASCADE',
      foreignKey: 'type_id',
      targetKey: 'id'
    });
  };

  return Expense;
};
