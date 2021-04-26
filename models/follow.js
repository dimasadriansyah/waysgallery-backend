'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Follow.belongsTo(models.User, { as: 'followingUser', foreignKey: 'following' });
      Follow.belongsTo(models.User, { as: 'followedUser', foreignKey: 'followed' });
    }
  }
  Follow.init(
    {
      followed: DataTypes.INTEGER,
      following: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'Follow',
    }
  );
  return Follow;
};
