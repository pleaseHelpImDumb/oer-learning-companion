const crypto = require("crypto");

function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex");
}

module.exports = { generateCSRFToken };
