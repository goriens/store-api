const { StatusCodes } = require("http-status-codes");
const Review = require("../models/review.model");
const Product = require("../models/product.model");
const { BadRequestError, NotFoundError } = require("../errors");
const checkPermission = require("../utils/checkPermission");

const createReview = async (req, res) => {
  req.body.user = req.user.userId;
  const { product: productId } = req.body;
  const checkProduct = await Product.findOne({ _id: productId });
  if (!checkProduct) {
    throw new BadRequestError(`No product found with this id:${productId}`);
  }
  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user.userId,
  });
  if (alreadySubmitted) {
    throw new BadRequestError("Already submitted review");
  }
  const review = await Review.create(req.body);
  return res.status(StatusCodes.CREATED).json({ review });
};
const getAllReview = async (req, res) => {
  const reviews = await Review.find({}).populate({
    path: "product",
    select: "name price",
  });
  return res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};
const getSingleReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId }).populate("product");
  if (!review) {
    throw new NotFoundError(`No Review found with id:${reviewId}`);
  }
  return res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No Review found with id:${reviewId}`);
  }
  checkPermission(req.user, review.user);
  review.rating = rating;
  review.title = title;
  review.comment = comment;
  review.save();

  return res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const { id: reviewId } = req.params;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new NotFoundError(`No Review found with id:${reviewId}`);
  }
  checkPermission(req.user, review.user);
  await review.deleteOne();
  return res
    .status(StatusCodes.OK)
    .json({ msg: "Review successfully deleted" });
};
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  return res.status(StatusCodes.OK).json({ count: reviews.length, reviews });
};
module.exports = {
  createReview,
  getAllReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
