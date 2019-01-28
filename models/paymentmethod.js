'use strict';
module.exports = (sequelize, DataTypes) => {
  var PaymentMethod = sequelize.define('PaymentMethod', {
    account_number: DataTypes.STRING,
    description: DataTypes.TEXT,
    type_id: {
      type: DataTypes.INTEGER,
      references: 'payment_type', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    },
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
    tableName: 'payment_method'
  });

  PaymentMethod.associate = function (models) {
    models.PaymentMethod.belongsTo(models.PaymentType, {
      onDelete: 'CASCADE',
      foreignKey: 'type_id',
      targetKey: 'id'
    });

    models.PaymentMethod.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id',
      targetKey: 'id'
    });

    models.PaymentMethod.hasMany(models.Expense, { foreignKey: 'method_id' });
  };

  return PaymentMethod;
};
