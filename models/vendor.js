'use strict';
module.exports = (sequelize, DataTypes) => {
  var Vendor = sequelize.define('Vendor', {
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    category: DataTypes.STRING,
    note: DataTypes.TEXT,
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
    tableName: 'vendor'
  });

  Vendor.associate = function (models) {
    models.Vendor.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id',
      targetKey: 'id'
    });
  };

  return Vendor;
};
