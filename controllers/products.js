const mongoose = require("mongoose");

const products = require("../models/products");
const cart = require("../models/cart");
const Order = require("../models/orders.js");
const categories = require("../models/category.js");

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      price,
      discountedPrice,
      isBestSeller,
      isDealOfTheWeek,
      categoryId,
      languageId,
    } = req.body;

    if (!productName || !price || !categoryId || !languageId) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required.",
      });
    }

    const cleanNumber = (value) => {
      if (!value) return 0;
      const num = parseFloat(String(value).replace(/[^\d.-]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const parserdPrice = cleanNumber(price);
    const parsedDiscountedPrice = cleanNumber(discountedPrice);

    // const isDealOfTheWeekProductAvailable = await  products.findOne({isDeaOfTheWeek: true})

    // if(isDealOfTheWeekProductAvailable){
    //     await products.updateOne({{isDeaOfTheWeek: false}})
    // }
  if(isDealOfTheWeek) {
      await products.updateOne({isDealOfTheWeek : true}, {$set: { isDealOfTheWeek: false }})
  }

    const newProduct = await products.create({
      productName,
      image: req.file.filename,
      price: parserdPrice,
      isBestSeller,
      isDealOfTheWeek,
      discountedPrice: parsedDiscountedPrice,
      categoryId,
      languageId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "discountedPrice:asc",
      minPrice,
      maxPrice,
      selectedProducts,
      selectedLanguages,
    } = req.query;

    const searchFilter = {};
    if (search) {
      searchFilter.productName = { $regex: search, $options: "i" };
    }

    if (minPrice || maxPrice) {
      searchFilter.discountedPrice = {};
      if (minPrice) searchFilter.discountedPrice.$gte = parseFloat(minPrice);
      if (maxPrice) searchFilter.discountedPrice.$lte = parseFloat(maxPrice);
    }

    if (selectedProducts) {
      const idsArray = selectedProducts
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (idsArray.length) searchFilter._id = { $in: idsArray };
    }

    if (selectedLanguages) {
      const langArray = selectedLanguages
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (langArray.length) searchFilter.languageId = { $in: langArray };
    }

    let sortOptions = { discountedPrice: 1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = {};
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const pipeline = [
      { $match: searchFilter },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 1,
          productName: 1,
          image: 1,
          price: 1,
          discountedPrice: 1,
          oldPrice: 1,
          categoryId: "$category._id",
          categoryName: "$category.name",
          languageId: 1,
        },
      },
    ];

    const allProducts = await products.aggregate(pipeline);
    const totalCount = await products.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      data: allProducts,
      page: pageNumber,
      totalPages,
      totalProducts: totalCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getProductsBasedOnCategory = async (req, res) => {
  console.log("fddf");
  try {
    const categoryName = req.query.catName?.trim();

    let matchStage = {};

    if (
      categoryName &&
      ["spices", "pulses"].includes(categoryName.toLowerCase())
    ) {
      const category = await categories.findOne({ name: categoryName });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category '${categoryName}' not found`,
        });
      }
      matchStage = { categoryId: category._id };
    }

    const allProducts = await products.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categories",
        },
      },
      { $unwind: "$categories" },
      { $match: matchStage },
      { $sort: { createdAt: 1 } },
      { $limit: 8 },
      {
        $project: {
          productName: 1,
          discountedPrice: 1,
          image: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: allProducts,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getBestSellingProducts = async (req, res) => {
  try {
    const bestSellingProducts = await products.aggregate([
      {
        $match: { isBestSeller: "true" },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          productName: 1,
          discountedPrice: 1,
          image: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: bestSellingProducts,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTrendingProducts = async (req, res) => {
  try {
    const products = await Order.aggregate([
      {
        $unwind: "$cartItems",
      },
      {
        $group: {
          _id: "$cartItems.productId",
          productName: { $first: "$cartItems.productName" },
          productImage: { $first: "$cartItems.image" },
          price: { $first: "$cartItems.price" },
          discountedPrice: { $first: "$cartItems.discountedPrice" },
          totalOrder: { $sum: 1 },
        },
      },
      {
        $addFields: {
          productId: { $toObjectId: "$_id" },
        },
      },
      {
        $sort: {
          totalOrder: -1,
        },
      },
      {
        $limit: 4,
      },
    ]);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
      message: "Fetched All Trending Products Successfully!",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

const getDealOfTheWeekProduct = async(req,res) => {
    try{
            const dealOfTheWeekProduct = await products.findOne({ isDealOfTheWeek : true })

            if(!dealOfTheWeekProduct){
               return  res.status(400).json({ success: false, message: "deal of the week product is not available!"})
            }

            return res.status(200).json({ success: true, data: dealOfTheWeekProduct, message: "Deal of the week product fetched successfully!"})
    }
    catch(error){
       return res.status(400).json({ success: false, message: error.message})
    }
}

const getProduct = async (req, res) => {
  try {
    const productId = req.params.id?.trim();

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const isProductAvailableInCart = await cart.aggregate([
      {
        $match: { productId: new mongoose.Types.ObjectId(productId) },
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
        $lookup: {
          from: "categories",
          localField: "productDetails.categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          productName: "$productDetails.productName",
          price: "$productDetails.price",
          discountedPrice: "$productDetails.discountedPrice",
          image: "$productDetails.image",
          quantity: "$quantity",
          categoryName: "$category.name",
        },
      },
      {
        $project: {
          _id: 0,
          productDetails: 0,
          category: 0,
        },
      },
    ]);

    if (!isProductAvailableInCart.length) {
      const singleProduct = await products.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(productId) },
        },
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            productName: 1,
            price: 1,
            discountedPrice: 1,
            image: 1,
            categoryName: "$category.name",
          },
        },
      ]);

      console.log("Fetched single product:", singleProduct);

      if (!singleProduct.length) {
        return res.status(404).json({
          success: false,
          message: "Product not found!",
        });
      }

      return res.status(200).json({
        success: true,
        data: { ...singleProduct[0], quantity: 1 },
        message: "Product fetched successfully!",
      });
    }

    return res.status(200).json({
      success: true,
      data: isProductAvailableInCart,
      message: "Product fetched successfully!",
    });
  } catch (error) {
    console.error("Error fetching product:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllProductsForDashboard = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "createdAt:desc",
      // minPrice,
      // maxPrice,
      // selectedProducts,
      // selectedLanguages,
    } = req.query;

    const searchFilter = {};
    if (search) {
      searchFilter.productName = { $regex: search, $options: "i" };
    }

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = { [key]: order === "asc" ? 1 : -1 };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const allProducts = await products.aggregate([
      { $match: searchFilter },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "language",
        },
      },
      { $unwind: { path: "$language", preserveNullAndEmptyArrays: true } },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          _id: 1,
          productName: 1,
          image: 1,
          price: 1,
          discountedPrice: 1,
          categoryId: "$category._id",
          categoryName: "$category.name",
          languageId: "$language._id",
          languageName: "$language.name",
        },
      },
    ]);

    if (!allProducts || allProducts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found!" });
    }

    const totalCount = await products.countDocuments(allProducts);
    const totalPages = Math.ceil(totalCount / limitNumber);

    return res.status(200).json({
      success: true,
      data: allProducts,
      page: pageNumber,
      totalPages,
      totalProducts: totalCount,
    });
  } catch (error) {
    console.error("Error in getAllProductsForDashboard:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

const updatedProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const isPorductAvailable = await products.findOne({ _id: productId });

    if (!isPorductAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found!" });
    }

    const {
      productName,
      price,
      discountedPrice,
      isBestSeller,
      isDealOfTheWeek,
      categoryId,
      languageId,
      oldImage,
    } = req.body;

    const imageToUse = req.file ? req.file.filename : oldImage;

  if(isDealOfTheWeek) {
      await products.updateOne({isDealOfTheWeek : true}, {$set: { isDealOfTheWeek: false }})
  }


    const upatedProductData = {
      productName,
      image: imageToUse,
      price,
      discountedPrice,
      isBestSeller,
      isDealOfTheWeek,
      categoryId,
      languageId,
    };

    const updatedProduct = await products.findByIdAndUpdate(
      { _id: isPorductAvailable._id },
      { $set: upatedProductData }
    );

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product is not  updated successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product updated successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const isPorductAvailable = await products.findOne({ _id: productId });

    if (!isPorductAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found!" });
    }

    const deletedProduct = await products.findByIdAndDelete(
      isPorductAvailable._id
    );
    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product is not  deleted successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Porduct deleted successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductsBasedOnCategory,
  getBestSellingProducts,
  getTrendingProducts,
  getDealOfTheWeekProduct,
  getProduct,
  getAllProductsForDashboard,
  updatedProduct,
  deleteProduct,
};
