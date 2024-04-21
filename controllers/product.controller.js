const path = require("path");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/product.model");
const { NotFoundError, BadRequestError } = require("../errors");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  return res.status(StatusCodes.OK).json(product);
};
const getAllProducts = async (req, res) => {
  const products = await Product.find();
  return res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new NotFoundError(`No Product Found with id:${productId}`);
  }
  return res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new NotFoundError(`No Product Found with id:${productId}`);
  }
  return res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId });
  if (!product) {
    throw new NotFoundError(`No Product Found with id:${productId}`);
  }
  await product.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Product successfully deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new BadRequestError("Please upload your product Image");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new BadRequestError("Please upload a valid Image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new BadRequestError("Image cannot be more than 1MB");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
