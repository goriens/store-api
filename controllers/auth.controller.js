const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { attachCookiesRes, createTokenUser } = require("../utils");

const register = async (req, res) => {
  const { name, password, email } = req.body;
  const duplicateEmail = await User.findOne({ email });
  console.log(duplicateEmail);
  if (duplicateEmail) {
    throw new BadRequestError("Email Already Exist");
  }
  const user = await User.create({ name, password, email });
  const userToken = createTokenUser(user);
  attachCookiesRes({ res, user: userToken });
  return res.status(StatusCodes.CREATED).json({ user: userToken });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please Provide Email & Password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("No User Found");
  }
  const checkPassword = await user.comparePassword(password);
  if (!checkPassword) {
    throw new UnauthenticatedError("Email or Password invalid");
  }
  const userToken = createTokenUser(user);
  attachCookiesRes({ res, user: userToken });
  return res.status(StatusCodes.CREATED).json({ user: userToken });
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Logout Successfully" });
};

module.exports = { register, login, logout };
