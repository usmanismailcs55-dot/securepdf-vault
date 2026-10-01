const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  console.error("========== SERVER ERROR ==========");
  console.error(err);
  console.error("==================================");

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error.",
    });
  }

  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      message: "Only PDF files are allowed.",
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;