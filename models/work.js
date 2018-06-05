'use strict';
module.exports = (sequelize, DataTypes) => {
  var WorkOrder = sequelize.define('WorkOrder', {
    description: DataTypes.TEXT,
    status: DataTypes.TEXT,
    estimation: DataTypes.DECIMAL(10, 2),
    scheduled_date: DataTypes.DATE,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    assignee_name: DataTypes.TEXT,
    assignee_phone: DataTypes.TEXT,
    assignee_email: DataTypes.TEXT,
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
    tableName: 'work_order'
  });

  WorkOrder.associate = function (models) {
    models.WorkOrder.belongsTo(models.PropertyUnit, {
      onDelete: 'CASCADE',
      foreignKey: 'unit_id',
      targetKey: 'id'
    });
    models.WorkOrder.belongsTo(models.Company, {
      onDelete: 'CASCADE',
      foreignKey: 'company_id',
      targetKey: 'id'
    });
  };

  return WorkOrder;
};
