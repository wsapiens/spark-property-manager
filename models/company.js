'use strict';
module.exports = (sequelize, DataTypes) => {
  var Company = sequelize.define('Company', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING
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
    tableName: 'company'
  });

  Company.associate = function(models) {
    models.Company.hasMany(models.Property, { foreignKey: 'company_id' });
    models.Company.hasMany(models.User, { foreignKey: 'company_id' });
    models.Company.hasMany(models.Tenant, { foreignKey: 'company_id' });
  };

  return Company;
};
