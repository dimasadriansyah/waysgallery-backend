'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Hire extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hire.belongsTo(models.User, { as: 'orderedBy', foreignKey: 'orderBy' });
      Hire.belongsTo(models.User, { as: 'offeredTo', foreignKey: 'orderTo' });
      Hire.hasOne(models.Project, { as: 'project', foreignKey: 'hireId' });
    }
  }
  Hire.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      price: DataTypes.INTEGER,
      orderBy: DataTypes.INTEGER,
      orderTo: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'Hire',
    }
  );
  return Hire;
};
