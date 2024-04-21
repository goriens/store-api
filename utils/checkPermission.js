const { UnauthorizedError } = require("../errors");

const checkPermission = (reqUser, userId) => {
  if (reqUser.role === "admin") return;
  if (reqUser.userId === userId.toString()) return;
  throw new UnauthorizedError("Not Authorized to access this route");
};

module.exports = checkPermission;
