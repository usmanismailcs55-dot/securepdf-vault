const sensitiveFields = [
  "password",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "secret",
  "privatekey",
  "transactionhash",
];

function sanitize(data) {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase();

    if (
      sensitiveFields.some((field) => normalizedKey.includes(field))
    ) {
      result[key] = "[REDACTED]";
    } else if (value && typeof value === "object") {
      result[key] = sanitize(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function securityLog(event, data = {}) {
  console.log(`[SECURITY] ${event}`, sanitize(data));
}

module.exports = {
  securityLog,
  sanitize,
};