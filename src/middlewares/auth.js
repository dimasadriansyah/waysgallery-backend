const jwt = require('jsonwebtoken');
const secret = process.env.SECRET_TOKEN;

exports.auth = async (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) {
    return res.status(400).json({
      status: 'failed',
      message: 'No token! Authorization denied',
    });
  }

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'failed',
      message: 'Invalid Token',
    });
  }
};
