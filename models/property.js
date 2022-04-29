'use strict';

module.exports = (sequelize, DataTypes) => {
  var Property = sequelize.define('Property', {
    address_street: { type: DataTypes.STRING, allowNull: false },
    address_city: { type: DataTypes.STRING, allowNull: false },
    address_state: { type: DataTypes.STRING, allowNull: false },
    address_zip: { type: DataTypes.STRING, allowNull: false },
    index_number: DataTypes.STRING,
    loan_info: DataTypes.STRING,
    memo: DataTypes.STRING,
    company_id: {
      type: DataTypes.INTEGER,
      references: 'company', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    },
    type_id: {
      type: DataTypes.INTEGER,
      references: 'property_type', // <<< Note, its table's name, not object name
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
    tableName: 'property'
  });

  Property.associate = function(models) {
    models.Property.hasMany(models.PropertyUnit, { foreignKey: 'property_id', onDelete: 'cascade' });

    models.Property.belongsTo(models.PropertyType, {
      onDelete: 'CASCADE',
      foreignKey: 'type_id',
      targetKey: 'id'
    });

    models.Property.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id',
      targetKey: 'id'
    });
  };

  return Property;
};
