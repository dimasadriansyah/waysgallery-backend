const { Post, Photo, User, Project, ProjectImage, Hire } = require('../../models');
const Joi = require('joi');

// =================================================================================
// ADD Project
// =================================================================================

exports.addProject = async (req, res) => {
  const body = req.body;
  const file = req.files;
  try {
    const project = await Project.create({
      userId: req.user.id,
      hireId: req.params.hireId,
      description: body.description,
    });

    if (!project) {
      return res.status(400).json({
        status: 'failed',
        message: 'Failed to send project please try again',
      });
    }

    const image = async () => {
      return Promise.all(
        file.images.map(async (image) => {
          await ProjectImage.create({
            projectId: project.id,
            image: image.path,
          });
        })
      );
    };

    const update = await Hire.update({ status: 'WAITING' }, { where: { id: req.params.hireId } });
    if (!update) {
      res.status(400).json({
        status: 'failed',
        message: 'Failed to send project, please try again',
      });
    }

    image().then(async () => {
      const response = await Hire.findOne({
        where: { id: req.params.hireId },
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
      });

      res.status(200).json({
        status: 'success',
        message: 'Project sent successfully, please wait until vendor accept the project',
        data: {
          hire: response,
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
