import { couponValidation } from "../../utils/Coupon/coupon.validation.js";
import { checkProductAvailability } from "../../utils/Cart/check-product-availability.js";
import { getUserCart } from "../../utils/Cart/get-user-cart.js";

import Product from "../../../DB/Models/product.model.js";
import Cart from "../../../DB/Models/cart.model.js";
import Order from "../../../DB/Models/order.model.js";
import CouponUsers from "../../../DB/Models/coupon-users.model.js";

import { DateTime } from "luxon";
import { qrCodeGeneration } from "../../utils/qr-code.js";
import createInvoice from "../../utils/pdfkit.js";
import sendEmailService from "../services/send-email.service.js";
import fs from "fs";

//================================= add order ====================================

/**
 * destructure the request body
 * create new document in the database
 * check user login
 * check if the product is available
 * check if logggedIn user already have cart
 * add product to cart
 * create order
 * create invoice
 * send email
 * generate QR code
 * create invoice pdf
 * send invoice pdf to user email
 * delete invoice pdf after sending
 */

export const createOrder = async (req, res, next) => {
  //destructure the request body
  const {
    productId,
    quantity,
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: user } = req.authUser;

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, user);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  // product check
  const isProductAvailable = await checkProductAvailability(
    productId,
    quantity
  );
  if (!isProductAvailable)
    return next({ message: "Product is not available", cause: 400 });

  let orderItems = [
    {
      title: isProductAvailable.title,
      quantity,
      price: isProductAvailable.appliedPrice,
      productId: isProductAvailable._id,
    },
  ];

  //prices
  let shippingPrice = orderItems[0].price * quantity;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  isProductAvailable.stock -= quantity;
  await isProductAvailable.save();

  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  // generate QR code
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      user: order.user,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);

  // genrate invoice
  const orderInvoice = {
    shipping: {
      name: req.authUser.username,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      couponAmount: coupon?.couponAmount,
    },
    orderCode: order._id,
    orderStatus: order.orderStatus,
    date: order.createdAt,
    items: order.orderItems,
    totalPrice: order.totalPrice,
  };

  // Create invoice pdf
  createInvoice(orderInvoice, `invoice-${order._id}.pdf`);

  // Send invoice pdf to user email
  await sendEmailService({
    to: req.authUser.email,
    subject: "Order Confirmation",
    message: "<h1>Thank you for your order!</h1>",
    attachments: [
      {
        path: `./Files/invoice-${order._id}.pdf`,
      },
    ],
  });

  // Delete invoice pdf after sending
  fs.unlink(`./Files/invoice-${order._id}.pdf`, (err) => {
    if (err) throw err;
  });

  // send response
  res
    .status(201)
    .json({ message: "Order created successfully", order, orderQR });
};

//================================= Cancel order ====================================
/**
 * Check if the order is cancellable
 * Update order status to "Cancelled"
 * Send response
 */
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params;

  // Find the order by ID
  const order = await Order.findById(orderId);
  if (!order) {
    return next({ message: "Order not found", cause: 404 });
  }

  // Check if the order is cancellable
  const currentTime = new Date();
  const orderCreationTime = order.createdAt;
  const timeDiff = currentTime - orderCreationTime;
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
  if (hoursDiff >= 24) {
    return next({ message: "Order cannot be cancelled", cause: 400 });
  }

  // Update order status to "Cancelled"
  order.orderStatus = "Cancelled";
  await order.save();

  res.status(200).json({ message: "Order cancelled successfully" });
};

//================================= Cart To Order ====================================//

/**
 * destructure the request body
 * create new document in the database
 * check user login
 * check if the product is available
 * check if logggedIn user already have cart
 * add product to cart
 * create order
 * create invoice
 * send email
 * generate QR code
 * create invoice pdf
 * send response
 * delete cart
 * update stock
 * update coupon
 * return the response
 * check if coupon is valid
 * check if coupon is expired
 * check if coupon is disabled
 * check if coupon is assigned to the user
 * create order
 * generate QR code
 * create invoice pdf
 * send invoice pdf to user email
 * delete invoice pdf after sending
 */

export const cartToOrder = async (req, res, next) => {
  //destructure the request body
  const {
    couponCode,
    paymentMethod,
    phoneNumbers,
    address,
    city,
    postalCode,
    country,
  } = req.body;

  const { _id: user } = req.authUser;
  // cart items
  const userCart = await getUserCart(user);
  if (!userCart) return next({ message: "Cart not found", cause: 404 });

  // coupon code check
  let coupon = null;
  if (couponCode) {
    const isCouponValid = await couponValidation(couponCode, user);
    if (isCouponValid.status)
      return next({
        message: isCouponValid.message,
        cause: isCouponValid.status,
      });
    coupon = isCouponValid;
  }

  // product check
  const isProductAvailable = await checkProductAvailability(
    productId,
    quantity
  );
  if (!isProductAvailable)
    return next({ message: "Product is not available", cause: 400 });

  let orderItems = userCart.products.map((cartItem) => {
    return {
      title: cartItem.title,
      quantity: cartItem.quantity,
      price: cartItem.basePrice,
      productId: cartItem.productId,
    };
  });

  //prices
  let shippingPrice = userCart.subTotal;
  let totalPrice = shippingPrice;

  if (coupon?.isFixed && !(coupon?.couponAmount <= shippingPrice))
    return next({ message: "You cannot use this coupon", cause: 400 });

  if (coupon?.isFixed) {
    totalPrice = shippingPrice - coupon.couponAmount;
  } else if (coupon?.isPercentage) {
    totalPrice = shippingPrice - (shippingPrice * coupon.couponAmount) / 100;
  }

  // order status + paymentmethod
  let orderStatus;
  if (paymentMethod === "Cash") orderStatus = "Placed";

  // create order
  const order = new Order({
    user,
    orderItems,
    shippingAddress: { address, city, postalCode, country },
    phoneNumbers,
    shippingPrice,
    coupon: coupon?._id,
    totalPrice,
    paymentMethod,
    orderStatus,
  });

  await order.save();

  await Cart.findByIdAndDelete(userCart._id);

  for (const item of order.orderItems) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.quantity } }
    );
  }

  if (coupon) {
    await CouponUsers.updateOne(
      { couponId: coupon._id, userId: user },
      { $inc: { usageCount: 1 } }
    );
  }

  // generate QR code
  const orderQR = await qrCodeGeneration([
    {
      orderId: order._id,
      user: order.user,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
    },
  ]);

  // genrate invoice
  const orderInvoice = {
    shipping: {
      name: req.authUser.username,
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      state: order.shippingAddress.postalCode,
      country: order.shippingAddress.country,
      couponAmount: coupon?.couponAmount,
    },
    orderCode: order._id,
    orderStatus: order.orderStatus,
    date: order.createdAt,
    items: order.orderItems,
    totalPrice: order.totalPrice,
  };

  // Create invoice pdf
  createInvoice(orderInvoice, `invoice-${order._id}.pdf`);

  // Send invoice pdf to user email
  await sendEmailService({
    to: req.authUser.email,
    subject: "Order Confirmation",
    message: "<h1>Thank you for your order!</h1>",
    attachments: [
      {
        path: `./Files/invoice-${order._id}.pdf`,
      },
    ],
  });

  // Delete invoice pdf after sending
  fs.unlink(`./Files/invoice-${order._id}.pdf`, (err) => {
    if (err) throw err;
  });

  res
    .status(201)
    .json({ message: "Order created successfully", order, orderQR });
};

//================================= Deliever Order ====================================
/**
 * Check if the order is "Paid" or "Placed"
 * Check if the user is authenticated
 * Check if the user is an admin
 * Check if the user is the owner of the order
 * Update order status to "Delivered"
 * Send response
 */
export const delieverOrder = async (req, res, next) => {
  const { orderId } = req.params;

  const updateOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: ["Paid", "Placed"] },
    },
    {
      orderStatus: "Delivered",
      deliveredAt: DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss"),
      deliveredBy: req.authUser._id,
      isDelivered: true,
    },
    {
      new: true,
    }
  );

  if (!updateOrder)
    return next({
      message: "Order not found or cannot be delivered",
      cause: 404,
    });

  res
    .status(200)
    .json({ message: "Order delivered successfully", order: updateOrder });
};
