const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/cart");
const Order = require("../models/orders");

const webHookForPayment = async (req, res) => {
  console.log("fdfdfds")
  const sig = req.headers["stripe-signature"];
  let event;

  try {
  
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }


  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const { userId, orderId } = paymentIntent.metadata || {};

    if (!userId || !orderId) {

      return res
        .status(400)
        .json({ success: false, message: "Missing userId or orderId metadata." });
    }

    try {

      const order = await Order.findById(orderId);
      if (!order) {

        return res.status(404).json({ success: false, message: "Order not found." });
      }

      order.status = "paid";
      order.paymentIntentId = paymentIntent.id;
      await order.save();

      console.log(` Order ${orderId} marked as paid.`);

 
      if (mongoose.Types.ObjectId.isValid(userId)) {
        const deletedCart = await Cart.deleteMany({ userId });
        if (deletedCart) {
          console.log(`🛒 Cart deleted for user ${userId}`);
        } else {
          console.log(` No cart found for user ${userId}`);
        }
      } else {
        console.warn(` Invalid userId format: ${userId}`);
      }

     
      return res.json({ received: true });
    } catch (error) {
  
      return res.status(500).json({ success: false, message: error.message });
    }
  }

 
  res.json({ received: true });
};

module.exports = webHookForPayment;
