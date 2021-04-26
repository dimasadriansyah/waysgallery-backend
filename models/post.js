'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.hasMany(models.Photo, { as: 'photos', foreignKey: 'postId' });
      Post.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
      Post.hasMany(models.PostComment, { as: 'comments', foreignKey: 'postId' });
      Post.hasMany(models.PostLike, { as: 'likes', foreignKey: 'postId' });
    }
  }
  Post.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      userId: DataTypes.INTEGER,
    },
    {
      defaultScope: {
        order: [['createdAt', 'DESC']],
      },
      sequelize,
      modelName: 'Post',
    }
  );
  return Post;
};
