const Cart = require("../models/cartItem");
const User = require("../models/user");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const Products = require("../models/products");
const Address = require("../models/address");
const Notification = require("../models/Notification");
require('dotenv').config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const createStripeSession = async (
  itemNames,
  currency,
  successUrl,
  cancelUrl,
  orderId,
  cartId,
  customerName,
) => {
  try {
    if (!Array.isArray(itemNames)) {
      throw new Error("itemNames is not an array");
    }

    const customer = await stripe.customers.create({
      name: customerName,
      address: {
        line1: "510 Townsend St",
        postal_code: "98140",
        city: "San Francisco",
        state: "CA",
        country: "US",
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items: itemNames.map((item) => ({
        price_data: {
          currency: currency,
          product_data: {
            name: `${item.productName} - Price: ${item.price}, Quantity: ${item.quantity}`,
            images: [item.img],
          },
          unit_amount: Math.round(item.price * item.quantity * 100),
        },
        quantity: 1,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        metadata: {
          orderId: orderId,
          cartId: cartId,
        },
      },
      customer: customer.id,
    });

    console.log("Session ID:", session.id);
    return session.id;
  } catch (error) {
    console.error("Error creating Stripe session:", error);
    throw error;
  }
};

module.exports.checkout = async (req, res) => {
  try {
    const userId = req.params.id;
    const { addressId } = req.body;

    if (!addressId) {
      return res.status(400).json({message:"Address ID is required"});
    }

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(400).json({message:"Invalid address ID"});
    }

    const cart = await Cart.findOne({ userId });
    const user = await User.findById(userId);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({message:"You do not have items in your cart"});
    }

    const order = new Order({
      userId,
      items: cart.items,
      addressId: addressId,
      totalBill: 0,
    });

    await order.save();

    let totalBill = 0;
    const itemNames = [];
    for (const item of cart.items) {
      const product = await Products.findById(item.productId);
      if (!product) {
        console.log("Product not found:", item.productId);
        return res
          .status(400)
          .json({message: `Product with ID ${item.productId} not found`});
      }
      item.price = product.sellPrice || product.price;
      totalBill += item.quantity * item.price;
      itemNames.push({
        productName: product.productName,
        img: product.imageGallery[0],
        price: product.sellPrice || product.price,
        quantity: item.quantity,
      });
    }

    const customerName = address.fullName;

    const successUrl = "http://localhost:3000/success";
    const cancelUrl = "http://localhost:3000/cart";

    const sessionId = await createStripeSession(
      itemNames,
      "inr",
      successUrl,
      cancelUrl,
      order._id.toString(),
      cart._id.toString(),
      customerName,
    );

    order.totalBill = totalBill;
    await order.save();

    console.log("Order saved successfully");

    return res.status(201).json({
      message: "Order Saved Successfully",
      order: order,
      stripeSessionId: sessionId,
    });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// module.exports.checkout = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { addressId, couponId } = req.body;

//     // Perform validations for addressId
//     if (!addressId) {
//       return res.status(400).send("Address ID is required");
//     }

//     // Check if the address exists
//     const address = await Address.findById(addressId);
//     if (!address) {
//       return res.status(400).send("Invalid address ID");
//     }

//     const cart = await Cart.findOne({ userId });
//     const user = await User.findById(userId);

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).send("You do not have items in your cart");
//     }

//     let totalBill = 0;
//     const itemNames = [];
//     for (const item of cart.items) {
//       const product = await Products.findById(item.productId);
//       if (!product) {
//         console.log("Product not found:", item.productId);
//         return res
//           .status(400)
//           .send(`Product with ID ${item.productId} not found`);
//       }
//       item.price = product.sellPrice || product.price;
//       totalBill += item.quantity * item.price;
//       itemNames.push({
//         productName: product.productName,
//         img: product.imageGallery[0],
//         price: product.sellPrice || product.price,
//         quantity: item.quantity,
//       });
//     }
//     console.log("Total bill Before discount", totalBill);

//     let discount = 0;
//     if (couponId) {
//       const validCoupon = await Coupon.findById(couponId);
//       console.log("Valid Coupon:", validCoupon);
//       if (validCoupon) {
//         console.log("Coupon Percentage:", validCoupon.percentage);
//         discount = totalBill * (validCoupon.percentage / 100);
//       } else {
//         console.log("Invalid coupon or coupon not active");
//         return res.status(400).send("Invalid coupon");
//       }
//     }

//     console.log("Discount:", discount);

//     totalBill -= discount;

//     console.log("Total Bill after discount:", totalBill);

//     const successUrl = "http://localhost:3000/success";
//     const cancelUrl = "https://checkout.stripe.com/cancel";
//     const totalBillInCents = Math.round(totalBill * 100);

//     const sessionId = await createStripeSession(
//       totalBill,
//       itemNames,
//       "inr",
//       successUrl,
//       cancelUrl
//     );

//     const order = new Order({
//       userId,
//       items: cart.items,
//       addressId: addressId,
//       totalBill,
//       coupon: couponId || null,
//     });

//     console.log("Order:", order);

//     await order.save();

//     await Cart.findOneAndDelete({ userId });

//     console.log("Order saved successfully");

//     return res.status(201).json({
//       message: "Order Saved Successfully",
//       order: order,
//       stripeSessionId: sessionId,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Something went wrong");
//   }
// };

//stripe listen --forward-to localhost:5000/orders/webhook/stripe

const endpointSecret = process.env.END_POINT_SECRET;

module.exports.webhook = async (req, res) => {
  try {
    const rawBody = req.rawBody;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err) {
      console.log("err->>>", err);
      return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case "customer.created":
        const customerId = event.data.object.id;
        const customerName = event.data.object.name;
        const customerAddress = event.data.object.address;
        console.log("New customer created:", {
          customerId,
          customerName,
          customerAddress,
        });
        break;
      case "customer.updated":
        const customerUpdate = event.data.object;
        console.log("customer update: ", customerUpdate);
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        const paymentId = paymentIntentCreated.id;
        console.log("paymentId: ", paymentId);
        const orderId = paymentIntentCreated.metadata.orderId;
        console.log("orderId: ", orderId);

        await Order.updateOne(
          { _id: orderId },
          { $set: { paymentIntentId: paymentId } }
        );

        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        console.log(
          "paymentIntentRequiresAction successful: ",
          paymentIntentRequiresAction
        );
        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        console.log("Payment failed:", paymentIntentPaymentFailed);

        const orderId_failed = paymentIntentPaymentFailed.metadata.orderId;

        try {
          await Order.updateOne(
            { _id: orderId_failed },
            { paymentStatus: "failed" }
          );

          console.log("Payment failed for order:", orderId_failed);
        } catch (error) {
          console.error("Error handling payment failure:", error);
        }

        break;

      case "charge.succeeded":
        const chargeSucceeded = event.data.object;
        const receipt_url = chargeSucceeded.receipt_url;
        console.log("recept url: ", receipt_url);
        const orderId_charge = chargeSucceeded.metadata.orderId;

        await Order.updateOne(
          { _id: orderId_charge },
          { $set: { recept: receipt_url } }
        );
        console.log("chargeSucceeded successful: ", chargeSucceeded);
        break;

      case "charge.failed":
        try {
          const chargeId = event.data.object.id;
          const customerId = event.data.object.customer;

          console.log(
            `Charge failed for charge ID: ${chargeId}, Customer ID: ${customerId}`
          );
        } catch (error) {
          console.error("Error handling charge failed event:", error);
        }
        break;
      case "charge.updated":
        console.log("Charge updated:", event.data.object);
        break;
      case "invoice.created":
        const invoiceCreated = event.data.object;
        const invoiceId = invoiceCreated.id;
        const receiptUrl = invoiceCreated.receipt_url;
        console.log("invoice: ", invoiceId);
        console.log("receiptUrl: ", receiptUrl);
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        console.log("Payment intent succeeded:", paymentIntentSucceeded);
        console.log("Metadata:", paymentIntentSucceeded.metadata);

        const orderId1 = paymentIntentSucceeded.metadata.orderId;
        console.log("orderId1: ", orderId1);

        await Order.updateOne(
          { _id: orderId1 },
          {
            paymentStatus: "completed",
          }
        );
        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        console.log("Checkout session completed:", checkoutSessionCompleted);
        console.log("Metadata:", checkoutSessionCompleted.metadata);

        try {
          const cartId = checkoutSessionCompleted.metadata.cartId;
          const deletionResult = await Cart.findOneAndDelete({ cartId });

          if (deletionResult) {
            console.log("Cart deleted successfully for user");
            const latestNotification = await Notification.findOne().sort({
              _id: -1,
            });

            if (latestNotification) {
              await Notification.findByIdAndUpdate(
                latestNotification._id,
                { paymentStatus: "completed" },
                { new: true }
              );
              console.log(
                "Payment status updated for notification:",
                latestNotification._id
              );
            } else {
              console.log("No notifications found");
            }
          } else {
            console.log("Cart not found for user:", cartId);
          }
        } catch (error) {
          console.error(
            "Error deleting cart or updating payment status:",
            error
          );
        }

        break;

      case "checkout.session.expired":
        const checkoutSessionExpired = event.data.object;
        order_checkout = checkoutSessionExpired.metadata.orderId;
        await Order.findByIdAndDelete({ order_checkout });
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).end();
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
};

module.exports.get_orders = async (req, res) => {
  try {
    const userId = req.params.id;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId");
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.get_order_by_id = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const orders = await Order.find({
      userId: userId,
      "items.productId": productId,
    })
      .sort({ date_added: -1 }) // Sort by date_added in descending order
      .limit(1) // Limit the result to 1 order
      .populate("items.productId");

    if (orders.length === 0) {
      return res.status(404).json({
        message: "No orders found for the specified product and user",
      });
    }

    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
