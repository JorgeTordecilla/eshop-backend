const express = require("express");
const router = express.Router();
const Order = require("../models/order");
const OrderItem = require("../models/order-item");

router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    });
  if (!order) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

router.post("/", async (req, res) => {
  let orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );
  orderItemsIdsResoved = await orderItemsIds;

  let totalPrice = await Promise.all(
    orderItemsIdsResoved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  totalPrice = totalPrice.reduce((a, b) => a + b);
  let order = new Order({
    orderItems: orderItemsIdsResoved,
    ShippingAddress1: req.body.ShippingAddress1,
    ShippingAddress2: req.body.ShippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice,
    user: req.body.user,
  });
  order = await order.save();
  if (!order) {
    return res.status(400).send("The order cannot be created!");
  }
  res.send(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  if (!order) {
    return res.status(404).send("The order cannot be update!");
  }
  res.status(200).send(order);
});

router.delete("/:id", async (req, res) => {
  try {
    const removeOrder = await Order.findByIdAndDelete(req.params.id);
    if (!removeOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not fount",
      });
    }
    removeOrder.orderItems.forEach(async (id) => {
      await OrderItem.findByIdAndDelete(id);
    });
    res.status(200).json({
      success: true,
      message: "The Order is deleted!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

router.get("/get/totalsales", async (req, res) => {
  const totalsales = await Order.aggregate([
    { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
  ]);
  if (!totalsales) {
    return res.status(400).send("The order sales cannot be generated");
  }
  res.status(200).send({ totalsales: totalsales.pop().totalsales });
});

router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments({});
    if (!orderCount) {
      return res.status(500).json({
        success: false,
      });
    }
    res.status(200).json({ orderCount: orderCount });
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: {
        path: "product",
        populate: "category",
      },
    })
    .sort({ dateOrdered: -1 });
  if (!userOrderList) {
    return res.status(500).json({
      success: false,
    });
  }
  res.send(userOrderList);
});

module.exports = router;
