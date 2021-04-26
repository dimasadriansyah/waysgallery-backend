const { Post, Photo, User, PostLike, PostComment } = require('../../models');
const Joi = require('joi');

// =================================================================================
// GET POSTS
// =================================================================================

exports.getPosts = async (req, res) => {
  const { limit } = req.params;
  try {
    const posts = await Post.findAndCountAll({
      limit: parseInt(limit),
      attributes: { exclude: ['updatedAt'] },
      where: {},
      distinct: true,
      include: [
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'photo'],
        },
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['updatedAt', 'password'] },
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
        {
          model: PostComment,
          as: 'comments',
          attributes: { exclude: ['updatedAt'] },
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
      ],
    });
    res.status(200).json({
      status: 'success',
      message: 'Posts loaded successfully',
      data: {
        posts,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// GET POST
// =================================================================================

exports.getPost = async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findOne({
      where: { id },
      attributes: { exclude: ['updatedAt'] },
      include: [
        {
          model: Photo,
          as: 'photos',
        },
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['updatedAt', 'password'] },
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: { exclude: ['updatedAt'] },
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
        {
          model: PostComment,
          as: 'comments',
          attributes: { exclude: ['updatedAt'] },
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'avatar'],
          },
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: PostComment, as: 'comments' }, 'createdAt', 'DESC'],
      ],
    });

    if (!post) {
      res.status(400).json({
        status: 'failed',
        message: `No Post Found with ID of ${id}`,
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Post loaded successfully',
      data: {
        post,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// ADD POST
// =================================================================================

exports.addPost = async (req, res) => {
  const body = req.body;
  const file = req.files;
  try {
    const schema = Joi.object({
      title: Joi.string().required('Title is required'),
      description: Joi.string().required('Description is required'),
      photos: Joi.string().required('Please select at least one photo'),
    });

    const { error } = schema.validate({ ...req.body, photos: file.photos[0].path }, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: 'failed',
        message: error.details[0].message,
        errors: error.details.map((detail) => detail.message),
      });
    }

    const post = await Post.create({
      title: body.title,
      description: body.description,
      userId: req.user.id,
    });

    if (!post) {
      return res.status(400).json({
        status: 'failed',
        message: 'Failed to add post please try again',
      });
    }

    const photo = async () => {
      return Promise.all(
        file.photos.map(async (image) => {
          await Photo.create({
            postId: post.id,
            photo: image.path,
          });
        })
      );
    };

    photo().then(async () => {
      const response = await Post.findOne({
        where: { id: post.id },
        attributes: { exclude: ['updatedAt'] },
        include: [
          {
            model: Photo,
            as: 'photos',
            attributes: ['id', 'photo'],
          },
          {
            model: User,
            as: 'user',
            attributes: { exclude: ['updatedAt', 'password'] },
          },
          {
            model: PostLike,
            as: 'likes',
            attributes: { exclude: ['updatedAt'] },
            include: {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
          },
          {
            model: PostComment,
            as: 'comments',
            attributes: { exclude: ['updatedAt'] },
            include: {
              model: User,
              as: 'user',
              attributes: ['id', 'name'],
            },
          },
        ],
      });

      res.status(200).json({
        status: 'success',
        message: 'Post added successfully',
        data: {
          post: response,
        },
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// Add Like
// =================================================================================

exports.addLike = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const checking = await PostLike.findOne({
      where: {
        userId: user.id,
        postId: id,
      },
    });

    if (checking) {
      return res.status(400).json({
        status: 'failed',
        message: 'Already Liked',
      });
    }

    const like = await PostLike.create({
      userId: user.id,
      postId: id,
    });

    const response = await PostLike.findOne({
      where: { id: like.dataValues.id },
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'name'],
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'Liked successfully',
      data: {
        like: response,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// Remove Like
// =================================================================================

exports.removeLike = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  try {
    const like = await PostLike.destroy({
      where: {
        userId: user.id,
        postId: id,
      },
    });
    if (!like) {
      res.status(400).json({
        status: 'failed',
        message: 'Failed to dislike the post',
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Disliked successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// Add Comment
// =================================================================================

exports.addComment = async (req, res) => {
  const postId = req.params.id;
  const { id } = req.user;
  const { body } = req;
  console.log(body);
  try {
    const schema = Joi.object({
      comment: Joi.string().required('Text is required'),
    });

    const { error } = schema.validate({ ...body }, { abortEarly: false });

    if (error) {
      return res.status(400).send({
        status: 'failed',
        message: error.details[0].message,
        errors: error.details.map((detail) => detail.message),
      });
    }

    const comment = await PostComment.create({
      comment: body.comment,
      userId: id,
      postId,
    });

    const response = await PostComment.findOne({
      where: { id: comment.dataValues.id },
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'avatar'],
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Comment posted successfully',
      data: {
        comment: response,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// Remove Comment
// =================================================================================

exports.removeComment = async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await PostComment.destroy({
      where: {
        id,
      },
    });
    if (!comment) {
      res.status(400).json({
        status: 'failed',
        message: 'Failed to delete the comment',
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'Deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// GET POST By User
// =================================================================================

exports.getPostsByUser = async (req, res) => {
  const { limit } = req.params;
  const { userId } = req.params;
  try {
    const posts = await Post.findAndCountAll({
      limit: parseInt(limit),
      attributes: { exclude: ['updatedAt'] },
      where: {
        userId,
      },
      distinct: true,
      include: [
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'photo'],
        },
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['updatedAt', 'password'] },
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
        {
          model: PostComment,
          as: 'comments',
          attributes: { exclude: ['updatedAt'] },
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
      ],
    });
    res.status(200).json({
      status: 'success',
      message: 'Posts loaded successfully',
      data: {
        posts,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};

// =================================================================================
// GET POSTS BY FOLLOWING
// =================================================================================

exports.getPostsByFollowing = async (req, res) => {
  const { limit } = req.params;
  const { userId } = req.body;
  try {
    const posts = await Post.findAndCountAll({
      limit: parseInt(limit),
      attributes: { exclude: ['updatedAt'] },
      where: {
        userId,
      },
      distinct: true,
      include: [
        {
          model: Photo,
          as: 'photos',
          attributes: ['id', 'photo'],
        },
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['updatedAt', 'password'] },
        },
        {
          model: PostLike,
          as: 'likes',
          attributes: ['id'],
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
        {
          model: PostComment,
          as: 'comments',
          attributes: { exclude: ['updatedAt'] },
          include: {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        },
      ],
    });
    res.status(200).json({
      status: 'success',
      message: 'Posts loaded successfully',
      data: {
        posts,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: 'error',
      error: {
        message: 'Internal Server Error',
      },
    });
  }
};
