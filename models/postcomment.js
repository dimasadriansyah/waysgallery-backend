'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PostComment.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });
      PostComment.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    }
  }
  PostComment.init(
    {
      postId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      comment: DataTypes.STRING,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'PostComment',
    }
  );
  return PostComment;
};
