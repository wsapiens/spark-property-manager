'use strict';
module.exports = (sequelize, DataTypes) => {
  var PropertyUnit = sequelize.define('PropertyUnit', {
    name: DataTypes.STRING,
    is_building: { type: DataTypes.BOOLEAN, defaultValue: false },
    property_id: {
      type: DataTypes.INTEGER,
      references: 'property', // <<< Note, its table's name, not object name
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
    tableName: 'property_unit'
  });

  PropertyUnit.associate = function (models) {
    models.PropertyUnit.hasMany(models.Expense, { foreignKey: 'unit_id' });
    // models.PropertyType.hasOne(models.Tenant);

    models.PropertyUnit.belongsTo(models.Property, {
      onDelete: 'CASCADE',
      foreignKey: 'property_id',
      targetKey: 'id'
    });
  };

  return PropertyUnit;
};
