const mongoose = require("mongoose");
const wishList = require("../models/wishList.js");

const addedWishList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const isProductAvailableInWishList = await wishList.findOne({
      productId: id,
      userId: req.user.id,
    });

    if (isProductAvailableInWishList) {
      return res.status(200).json({
        success: true,
        data: isProductAvailableInWishList,
        message: "Product already available in the wishlist!",
      });
    }

    const newWish = await wishList.create({
      productId: id,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: newWish,
      message: "Product added to wishlist successfully!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getWishList = async (req, res) => {
  try {
    const wishListProducts = await wishList.aggregate([
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
          price: "$productDetails.price",
          discountedPrice: "$productDetails.discountedPrice",
          image: "$productDetails.image",
        },
      },
      {
        $project: { productDetails: 0 },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: wishListProducts,
      message:
        wishListProducts.length > 0
          ? "Wishlist fetched successfully!"
          : "Wishlist is empty!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductFromTheWishList = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const isProductAvailableInWishList = await wishList.findOne({
      productId: id,
      userId: req.user.id,
    });

    if (!isProductAvailableInWishList) {
      return res.status(200).json({
        success: false,
        message: "Product is not available in the wishlist!",
      });
    }

    return res.status(200).json({
      success: true,
      data: isProductAvailableInWishList,
      message: "Product is available in the wishlist!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteWishListProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await wishList.findOne({
      userId: req.user.id,
      productId: new mongoose.Types.ObjectId(id),
    });

    if (!product) {
      return res.status(200).json({
        success: false,
        message: "This product is not available in your wishlist",
      });
    }

    await wishList.deleteOne({
      userId: req.user.id,
      productId: new mongoose.Types.ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Product successfully removed from the wishlist!",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addedWishList,
  getWishList,
  getProductFromTheWishList,
  deleteWishListProduct,
};
