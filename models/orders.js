const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
   
    billingData: Object,
    deliveryData: Object,
    cartItems: Array,
    totalAmount: Number,
    orderId: String,
    paymentIntentId: String,
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
