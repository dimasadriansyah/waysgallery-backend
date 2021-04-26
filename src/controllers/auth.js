const { User, Post, Hire, Photo, Art, ProjectImage, Project, PostLike, PostComment, Follow } = require('../../models');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// =================================================================================
// REGISTER
// =================================================================================

exports.register = async (req, res) => {
  const body = req.body;
  const { email, password } = body;
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate({ ...body }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details[0].message,
        errors: error.details.map((detail) => detail.message),
      });
    }

    const checkEmail = await User.findOne({
      where: {
        email,
      },
    });

    if (checkEmail) {
      return res.status(400).json({
        status: 'failed',
        message: 'Email already exist',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...body,
      password: hashedPassword,
      until: new Date(),
    });

    const payload = {
      id: user.id,
    };

    jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: 3600000000000000 }, (err, token) => {
      if (err) throw err;
      return res.status(200).json({
        status: 'success',
        message: 'Registered in successfully',
        data: {
          token,
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
// LOGIN
// =================================================================================

exports.login = async (req, res) => {
  const body = req.body;
  const { email, password } = body;

  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate({ ...body }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 'failed',
        message: error.details[0].message,
        errors: error.details.map((detail) => detail.message),
      });
    }

    const user = await User.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({
        status: 'failed',
        message: 'Wrong email or password',
      });
    }

    const validate = await bcrypt.compare(password, user.password);

    if (!validate) {
      return res.status(400).json({
        status: 'failed',
        message: 'Wrong email or password',
      });
    }

    const payload = {
      id: user.id,
    };

    jwt.sign(payload, process.env.SECRET_TOKEN, { expiresIn: 3600000000000000 }, (err, token) => {
      if (err) throw err;
      return res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: {
          token,
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
// LoadUser
// =================================================================================

exports.loadUser = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findOne({
      where: { id },
      attributes: {
        exclude: ['updatedAt', 'password'],
      },
      include: [
        {
          model: Post,
          as: 'posts',
          include: [
            {
              model: Photo,
              as: 'photos',
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
        },
        {
          model: Hire,
          as: 'offers',
          include: [
            {
              model: Project,
              as: 'project',
              include: {
                model: ProjectImage,
                as: 'images',
              },
            },
            {
              model: User,
              as: 'offeredTo',
              attributes: { exclude: ['updatedAt', 'password'] },
            },
            {
              model: User,
              as: 'orderedBy',
              attributes: { exclude: ['updatedAt', 'password'] },
            },
          ],
        },
        {
          model: Hire,
          as: 'orders',
          include: [
            {
              model: Project,
              as: 'project',
              include: {
                model: ProjectImage,
                as: 'images',
              },
            },
            {
              model: User,
              as: 'offeredTo',
              attributes: { exclude: ['updatedAt', 'password'] },
            },
            {
              model: User,
              as: 'orderedBy',
              attributes: { exclude: ['updatedAt', 'password'] },
            },
          ],
        },
        {
          model: Art,
          as: 'arts',
        },
        {
          model: Follow,
          as: 'following',
          attributes: ['following'],
          include: {
            model: User,
            as: 'followedUser',
            attributes: ['id', 'name'],
          },
        },
        {
          model: Follow,
          as: 'followed',
          attributes: ['followed'],
          include: {
            model: User,
            as: 'followingUser',
            attributes: ['id', 'name'],
          },
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Art, as: 'arts' }, 'createdAt', 'DESC'],
      ],
    });

    if (!user) {
      res.status(400).json({
        status: 'failed',
        message: `No user found with ID of ${id}`,
      });
    }
    res.status(200).json({
      status: 'success',
      message: 'User loaded successfully',
      data: {
        user,
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
