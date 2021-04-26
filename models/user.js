'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post, { as: 'posts', foreignKey: 'userId' });
      User.hasMany(models.Art, { as: 'arts', foreignKey: 'userId' });
      User.hasMany(models.Hire, { as: 'offers', foreignKey: 'orderBy' });
      User.hasMany(models.Hire, { as: 'orders', foreignKey: 'orderTo' });
      User.hasMany(models.Project, { as: 'projects', foreignKey: 'userId' });
      User.hasMany(models.PostComment, { foreignKey: 'userId' });
      User.hasMany(models.PostLike, { foreignKey: 'userId' });
      User.hasMany(models.Follow, { as: 'following', foreignKey: 'following' });
      User.hasMany(models.Follow, { as: 'followed', foreignKey: 'followed' });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      greeting: DataTypes.STRING,
      avatar: DataTypes.STRING,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
