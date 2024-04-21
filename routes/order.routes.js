const express = require("express");
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");
const {
  createOrder,
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrder,
  updateOrder,
} = require("../controllers/order.controller");
const router = express.Router();

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrder);

router
  .route("/:id")
  .get(authenticateUser, getSingleOrder)
  .patch(authenticateUser, updateOrder);

module.exports = router;
