const { default: mongoose } = require("mongoose");
const Order = require("../models/orders");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const generateOrderId = async () => {
  // Get the latest order created
  const lastOrder = await Order.findOne({}, {}, { sort: { createdAt: -1 } });

  // Extract numeric part and increment
  let newNumber = 1;
  if (lastOrder && lastOrder.orderId) {
    const match = lastOrder.orderId.match(/ORD-(\d{4})-(\d+)/);
    if (match) {
      newNumber = parseInt(match[2], 10) + 1;
    }
  }

  // Create a new order ID like ORD-2025-000123
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(newNumber).padStart(6, "0")}`;
};


const buyProducts = async (req, res) => {
  try {
    const { totalPrice, currency, billingData, cartItems, deliveryData } =
      req.body;
    const userId = req.user?.id;

    console.log("User ID:", userId);
    console.log("Total Price:", totalPrice, "Currency:", currency);

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!totalPrice || isNaN(totalPrice)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing total price." });
    }

    const minimumCharge = {
      usd: 0.5,
      eur: 0.5,
      gbp: 0.3,
      inr: 1.0,
    };

    const currencyLower = currency?.toLowerCase();
    const minAllowed = minimumCharge[currencyLower] || 0.5;

    if (totalPrice < minAllowed) {
      return res.status(400).json({
        message: `The total amount must be at least ${minAllowed} ${currency.toUpperCase()} to process the payment.`,
      });
    }

        const orderId = await generateOrderId();

    const newOrder = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      billingData,
      deliveryData,
      cartItems,
      totalAmount: totalPrice,
      orderId,
      status: "pending",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: currencyLower,
      payment_method_types: ["card"],
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString(),
        billingData: JSON.stringify(billingData),
        deliveryData: JSON.stringify(deliveryData),
      },
    });

    newOrder.paymentIntentId = paymentIntent.id;
    await newOrder.save();

    console.log(`PaymentIntent created for order ${newOrder._id}`);

    res.status(200).json({
      success: true,
      message: "PaymentIntent created successfully.",
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error(" Stripe Error:", err);
    res.status(500).json({
      message:
        err.message ||
        "An unexpected error occurred during payment initialization.",
    });
  }
};

module.exports = buyProducts;
