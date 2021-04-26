// =======================================================================
// File Handler
// =======================================================================

exports.fileDownload = (req, res) => {
  const file = req.params.file;
  try {
    const path = __dirname + '/../../uploads/' + file;
    res.download(path);
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
