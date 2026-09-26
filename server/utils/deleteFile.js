const fs = require("fs/promises");

const deleteFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File may already be deleted
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

module.exports = deleteFile;