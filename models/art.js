'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Art extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Art.belongsTo(models.User, { as: 'arts', foreignKey: 'userId' });
    }
  }
  Art.init(
    {
      art: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'Art',
    }
  );
  return Art;
};
