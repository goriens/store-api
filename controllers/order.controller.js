const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const checkPermission = require("../utils/checkPermission");

const fakeStripeAPI = async ({ amount, currency }) => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const createOrder = async (req, res) => {
  const { cartItems, tax, shippingFee } = req.body;
  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please tax and shippingFee");
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product found with id:${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    //add item to order
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }
  const total = tax + shippingFee + subtotal;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  return res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};
const getAllOrder = async (req, res) => {
  const orders = await Order.find({});
  return res.status(StatusCodes.OK).json({ count: orders.length, orders });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No Order Found with id:${orderId}`);
  }
  checkPermission(req.user, order.user);
  return res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrder = async (req, res) => {
  const order = await Order.find({ user: req.user.userId });
  return res.status(StatusCodes.OK).json({ count: order.length, order });
};
const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No Order Found with id:${orderId}`);
  }
  checkPermission(req.user, order.user);
  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  return res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
};
