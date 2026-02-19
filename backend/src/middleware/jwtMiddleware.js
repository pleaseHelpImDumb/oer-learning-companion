const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const send401 = (res) => {
  res.status(StatusCodes.UNAUTHORIZED).json({
    error: "Authentication required",
  });
};

const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return send401(res);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return send401(res);
    }

    // Attach user to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    // Check CSRF for state-changing operations
    if (["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
      const csrfToken = req.get("X-CSRF-TOKEN");

      if (csrfToken !== decoded.csrfToken) {
        return send401(res);
      }
    }

    next();
  });
};

module.exports = authMiddleware;
