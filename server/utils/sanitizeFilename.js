const path = require("path");

const sanitizeFilename = (filename) => {
  const extension = path.extname(filename).toLowerCase();

  const name = path
    .basename(filename, extension)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);

  return `${name || "document"}${extension}`;
};

module.exports = sanitizeFilename;