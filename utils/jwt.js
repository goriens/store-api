const jwt = require("jsonwebtoken");

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};
const verifyJWT = ({ token }) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const attachCookiesRes = ({ res, user }) => {
  const token = createJWT({ payload: user });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

module.exports = { createJWT, verifyJWT, attachCookiesRes };
