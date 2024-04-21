const { StatusCodes } = require("http-status-codes");
const User = require("../models/user.model");
const {
  NotFoundError,
  BadRequestError,
  UnauthenticatedError,
} = require("../errors");
const {
  createTokenUser,
  attachCookiesRes,
  checkPermission,
} = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  return res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new NotFoundError("No User Found");
  }
  checkPermission(req.user, user._id);
  return res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  return res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide Both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesRes({ res, user: tokenUser });
  return res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide both values");
  }
  const user = await User.findById(req.user.userId);
  const checkPassword = await user.comparePassword(oldPassword);
  if (!checkPassword) {
    throw new UnauthenticatedError("Invalid Password");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(StatusCodes.OK)
    .json({ msg: "Password update successfully" });
};
module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
