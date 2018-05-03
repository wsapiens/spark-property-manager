'use strict';
module.exports = (sequelize, DataTypes) => {
  var PropertyType = sequelize.define('PropertyType', {
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
    tableName: 'property_type'
  });

  PropertyType.associate = function(models) {
    models.PropertyType.hasMany(models.Property, { foreignKey: 'type_id' });
  };

  return PropertyType;
};
