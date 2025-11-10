const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productSlug:{
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true,
      default: null,
    },

    price: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },

    languageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "language",
      required: true,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isDealOfTheWeek: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const products = mongoose.model("products", productSchema);
module.exports = products;
