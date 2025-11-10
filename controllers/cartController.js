const { mongoose } = require("mongoose");
const cart = require("../models/cart.js");

const addToCart = async (req, res) => {
  console.log(req.params.id);
  try {
    const existingCartItem = await cart.findOne({
      productId: new mongoose.Types.ObjectId(req.params.id),
      userId: req.user.id,
    });

    if (!existingCartItem) {
      await cart.create({
        productId: req.params.id,
        userId: req.user.id,
        quantity: 1,
      });
      return res
        .status(201)
        .json({ success: true, message: "Product added into the cart!" });
    }

    await cart.findByIdAndUpdate(existingCartItem._id, {
      $inc: { quantity: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Product quantity incremented in your cart!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getCartProducts = async (req, res) => {
  try {
    const allAddedProductsInCart = await cart.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user.id) },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $addFields: {
          productName: "$productDetails.productName",
          productSlug: "$productDetails.productSlug",
          price: "$productDetails.price",
          discountedPrice: "$productDetails.discountedPrice",
          image: "$productDetails.image",
          quantity: "$quantity",
        },
      },
      {
        $project: {
          productDetails: 0,
        },
      },
    ]);

    if (!allAddedProductsInCart) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "Cart is empty!" });
    }

    return res.status(200).json({
      success: true,
      data: allAddedProductsInCart,
      message: "All Products from the cart fetched successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCartProduct = async (req, res) => {
  try {
    const cartItem = await cart.findOne({
      productId: req.params.id,
      userId: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "This Product is not found in your cart!",
      });
    }

    await cart.deleteOne({ _id: cartItem._id });
    return res.status(200).json({
      success: true,
      message: "Product removed from your cart!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const incrementQuantity = async (req, res) => {
  try {
    console.log(req.params.id);
    const cartItem = await cart.findOne({
      productId: new mongoose.Types.ObjectId(req.params.id),
      userId: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "This Product is not found in your cart!",
      });
    }

    await cart.findByIdAndUpdate(cartItem._id, { $inc: { quantity: 1 } });

    return res.status(200).json({
      success: true,
      message: "Successfully incremented Product quantity in your cart!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const decrementQuantity = async (req, res) => {
  try {
    const cartItem = await cart.findOne({
      productId: req.params.id,
      userId: req.user.id,
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "This Product is not found in your cart!",
      });
    }

    if (cartItem.quantity > 1) {
      await cart.findByIdAndUpdate(cartItem._id, { $inc: { quantity: -1 } });
      return res.status(200).json({
        success: true,
        message: "Successfully decremented Product quantity in your cart!",
      });
    } else {
      await cart.deleteOne({ _id: cartItem._id });
      return res.status(200).json({
        success: true,
        message: "Product removed from your cart!",
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCartProducts,
  addToCart,
  deleteCartProduct,
  incrementQuantity,
  decrementQuantity,
};
