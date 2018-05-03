'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tenant = sequelize.define('Tenant', {
    firstname: { type: DataTypes.STRING, allowNull: false },
    lastname: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    lease_start: DataTypes.DATE,
    lease_end: DataTypes.DATE,
    unit_id: {
      type: DataTypes.INTEGER,
      references: 'property_unit', // <<< Note, its table's name, not object name
      referencesKey: 'id' // <<< Note, its a column name
    },
    company_id: {
      type: DataTypes.INTEGER,
      references: 'company', // <<< Note, its table's name, not object name
      referencesKey: 'id'
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
    tableName: 'tenant'
  });

  Tenant.associate = function (models) {
    models.Tenant.belongsTo(models.PropertyUnit, {
      onDelete: 'CASCADE',
      foreignKey: 'unit_id'
    });
    models.Tenant.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id'
    });
  };

  return Tenant;
};
