const validatePdfSignature = (buffer) => {
  if (!buffer || buffer.length < 4) {
    return false;
  }

  return buffer.subarray(0, 4).toString() === "%PDF";
};

module.exports = validatePdfSignature;