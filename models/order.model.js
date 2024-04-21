const mongoose = require("mongoose");

const SingleOrderItemsSchema = mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  amount: { type: Number, required: true },
  product: { type: mongoose.Schema.ObjectId, ref: "product", required: true },
});

const orderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemsSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "cancelled"],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;
