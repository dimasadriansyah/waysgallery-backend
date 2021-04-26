const { User, Project, ProjectImage, Hire } = require('../../models');

exports.approveHire = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const hire = await Hire.findOne({ where: { id } });
    if (!hire) {
      res.status(400).json({
        status: 'failed',
        message: 'Hire not found',
      });
    }

    if (hire.orderTo !== user.id) {
      res.status(400).json({
        status: 'failed',
        message: "You don't have the right",
      });
    }

    const update = await Hire.update({ status: 'APPROVED' }, { where: { id: id } });
    if (!update) {
      res.status(400).json({
        status: 'failed',
        message: 'Approvement failed, please try again',
      });
    }

    const response = await Hire.findOne({
      where: { id },
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
      message: 'Successfully approved',
      data: {
        hire: response,
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

exports.rejectHire = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const hire = await Hire.findOne({ where: { id } });
    if (!hire) {
      res.status(400).json({
        status: 'failed',
        message: 'Hire not found',
      });
    }

    if (hire.orderTo !== user.id) {
      res.status(400).json({
        status: 'failed',
        message: "You don't have the right",
      });
    }

    const update = await Hire.update({ status: 'CANCELED' }, { where: { id: id } });
    if (!update) {
      res.status(400).json({
        status: 'failed',
        message: 'Cancel failed, please try again',
      });
    }

    const response = await Hire.findOne({
      where: { id: id },
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
      message: 'Successfully canceled',
      data: {
        hire: response,
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

exports.createHire = async (req, res) => {
  const { id } = req.user;
  const body = req.body;
  try {
    if (id == body.orderTo) {
      res.status(400).json({
        status: 'failed',
        message: "You can't hire yourself",
      });
    }
    const hire = await Hire.create({
      ...body,
      orderBy: id,
    });
    if (!hire) {
      res.status(400).json({
        status: 'failed',
        message: 'Failed, please try again',
      });
    }

    const response = await Hire.findOne({
      where: { id: hire.id },
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
      message: 'Successfully create hiring',
      data: {
        hire: response,
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

exports.completeHire = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  try {
    const hire = await Hire.findOne({ where: { id } });
    if (!hire) {
      res.status(400).json({
        status: 'failed',
        message: 'Hire not found',
      });
    }

    if (hire.orderBy != user.id) {
      res.status(400).json({
        status: 'failed',
        message: "You don't have the right",
      });
    }

    const update = await Hire.update({ status: 'COMPLETED' }, { where: { id: id } });
    if (!update) {
      res.status(400).json({
        status: 'failed',
        message: 'Approvement failed, please try again',
      });
    }

    const response = await Hire.findOne({
      where: { id: id },
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
      message: 'Successfully approved',
      data: {
        hire: response,
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
