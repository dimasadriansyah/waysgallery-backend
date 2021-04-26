const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.fileUpload = (field1, field2) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      return {
        folder: `waysgallery/${file.fieldname}s`,
        resource_type: 'raw',
        public_id:
          path.parse(file.originalname).name +
          ' - ' +
          new Date().getFullYear() +
          '-' +
          new Date().getMonth() +
          '-' +
          new Date().getDate() +
          ' - ' +
          new Date().getHours() +
          '-' +
          new Date().getMinutes() +
          '-' +
          new Date().getSeconds() +
          '-' +
          new Date().getMilliseconds() +
          path.extname(file.originalname),
      };
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|svg|SVG)$/)) {
      req.fileValidationError = {
        message: 'Please select image files only',
      };
      return cb(new Error('Please select image files only'), false);
    }

    cb(null, true);
  };

  const fileSize = 5 * 1024 * 1024;

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize,
    },
  }).fields([
    {
      name: field1,
    },
    {
      name: field2,
    },
  ]);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (req.fileValidationError) {
        return res.status(400).json(req.fileValidationError);
      }
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            message: 'Max file size exceeded (5Mb)',
          });
        }
      }
      return next();
    });
  };
};
