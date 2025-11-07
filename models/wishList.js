const mongoose = require("mongoose");
const wishListSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "products",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  },
  { timestamps: true }
);

const wishList = mongoose.model("wishList", wishListSchema);
module.exports = wishList;
