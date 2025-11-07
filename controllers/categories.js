const category = require("../models/category.js");
const products = require("../models/products");
const mongoose = require("mongoose");

// const getAllFilters = async (req, res) => {
//   try {

//         const priceRange = await products.aggregate([
//       {
//         $group: {
//           _id: null,
//           minPrice: { $min: "$discountedPrice" },
//           maxPrice: { $max: "$discountedPrice" },
//         },
//       },
//     ]);

 
//     const minPrice = priceRange[0]?.minPrice ?? 0;
//     const maxPrice = priceRange[0]?.maxPrice ?? 0;


//     const allFilters = await products.aggregate([
//             {
//         $match: {
//           discountedPrice: { $gte: minPrice, $lte: maxPrice },
//         },
//       },

//       {
//         $lookup: {
//           from: "categories",
//           localField: "categoryId",
//           foreignField: "_id",
//           as: "categories",
//         },
//       },

//       {
//         $unwind: "$categories",
//       },

//       {
//         $lookup: {
//           from: "languages",
//           localField: "languageId",
//           foreignField: "_id",
//           as: "languages",
//         },
//       },

//       {
//         $unwind: "$languages",
//       },

//       {
//         $group: {
//           _id: {
//             categoryName: "$categories.name",
//           },

//           products: {
//             $push: {
//               productId: "$_id",
//               productName: "$productName",
//             },
//           },

//           allLanguages: {
//             $addToSet: {
//               languageId: "$languages._id",
//               languageName: "$languages.name",
//             },
//           },
//         },
//       },

//       {
//         $group: {
//           _id: null,
//           categories: {
//             $push: {
//               categoryName: "$_id.categoryName",
//               products: "$products",
//             },
//           },

//           languages: {
//             $addToSet: "$allLanguages",
//           },
//         },
//       },

//       {
//         $project: {
//           _id: 0,
//           categories: 1,
//           languages: {
//             $reduce: {
//               input: "$languages",
//               initialValue: [],
//               in: { $setUnion: ["$$value", "$$this"] },
//             },
//           },
//         },
//       },
//     ]);

//     if (!allFilters) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Categories are not available!" });
//     }

//     return res.status(200).json({
//       success: true,
//       data: allFilters,
//       message: "Products based on categories fetched successfully!",
//     });
//   } catch (error) {
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };


// const getAllFilters = async (req, res) => {
//   try {

//     const priceRange = await products.aggregate([
//       {
//         $group: {
//           _id: null,
//           minPrice: { $min: "$discountedPrice" },
//           maxPrice: { $max: "$discountedPrice" },
//         },
//       },
//     ]);

//     const minPrice = priceRange[0]?.minPrice ?? 0;
//     const maxPrice = priceRange[0]?.maxPrice ?? 0;

   
//     const allFilters = await products.aggregate([
//       {
//         $match: {
//           discountedPrice: { $gte: minPrice, $lte: maxPrice },
//         },
//       },
//       {
//         $lookup: {
//           from: "categories",
//           localField: "categoryId",
//           foreignField: "_id",
//           as: "category",
//         },
//       },
//       { $unwind: "$category" },
//       {
//         $lookup: {
//           from: "languages",
//           localField: "languageId",
//           foreignField: "_id",
//           as: "language",
//         },
//       },
//       { $unwind: "$language" },


//       {
//         $group: {
//           _id: {
//             productId: "$_id",
//             productName: "$productName",
//             categoryId: "$category._id",
//             categoryName: "$category.name",
//             languageId: "$language._id",
//             languageName: "$language.name",
//           },
//           count: { $sum: 1 },
//         },
//       },


//       {
//         $group: {
//           _id: {
//             categoryId: "$_id.categoryId",
//             categoryName: "$_id.categoryName",
//           },
//           products: {
//             $push: {
//               productId: "$_id.productId",
//               productName: "$_id.productName",
//               count: "$count",
//             },
//           },
//           languages: {
//             $addToSet: {
//               languageId: "$_id.languageId",
//               languageName: "$_id.languageName",
//             },
//           },
//         },
//       },


//       {
//         $group: {
//           _id: null,
//           categories: {
//             $push: {
//               categoryId: "$_id.categoryId",
//               categoryName: "$_id.categoryName",
//               products: "$products",
//             },
//           },
//           languages: {
//             $addToSet: "$languages",
//           },
//         },
//       },


//       {
//         $project: {
//           _id: 0,
//           minPrice: { $literal: minPrice },
//           maxPrice: { $literal: maxPrice },
//           categories: 1,
//           languages: {
//             $reduce: {
//               input: "$languages",
//               initialValue: [],
//               in: { $setUnion: ["$$value", "$$this"] },
//             },
//           },
//         },
//       },
//     ]);

//     if (!allFilters || allFilters.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No filters found!",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: allFilters,
//       message: "Filters with price range fetched successfully!",
//     });
//   } catch (error) {
//     console.error("Error in getAllFilters:", error);
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };


const getAllFilters = async (req, res) => {
  try {

    const priceRange = await products.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$discountedPrice" },
          maxPrice: { $max: "$discountedPrice" },
        },
      },
    ]);

    const minPrice = priceRange[0]?.minPrice ?? 0;
    const maxPrice = priceRange[0]?.maxPrice ?? 0;


    const allFilters = await products.aggregate([
      {
        $match: {
          discountedPrice: { $gte: minPrice, $lte: maxPrice },
        },
      },
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
        $lookup: {
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "language",
        },
      },
      { $unwind: "$language" },


      {
        $group: {
          _id: {
            productId: "$_id",
            productName: "$productName",
            categoryId: "$category._id",
            categoryName: "$category.name",
            languageId: "$language._id",
            languageName: "$language.name",
          },
          count: { $sum: 1 },
        },
      },


      {
        $group: {
          _id: {
            categoryId: "$_id.categoryId",
            categoryName: "$_id.categoryName",
          },
          products: {
            $push: {
              productId: "$_id.productId",
              productName: "$_id.productName",
              count: "$count",
            },
          },
          languages: {
            $addToSet: {
              languageId: "$_id.languageId",
              languageName: "$_id.languageName",
            },
          },
        },
      },

   
      {
        $group: {
          _id: null,
          categories: {
            $push: {
              categoryId: "$_id.categoryId",
              categoryName: "$_id.categoryName",
              products: "$products",
            },
          },
          languages: {
            $addToSet: "$languages",
          },
        },
      },


      {
        $project: {
          _id: 0,
          minPrice: { $literal: minPrice },
          maxPrice: { $literal: maxPrice },
          categories: 1,
          languages: {
            $reduce: {
              input: "$languages",
              initialValue: [],
              in: { $setUnion: ["$$value", "$$this"] },
            },
          },
        },
      },
    ]);


    const productCountPerLanguage = await products.aggregate([
      {
        $lookup: {
          from: "languages",
          localField: "languageId",
          foreignField: "_id",
          as: "language",
        },
      },
      { $unwind: "$language" },
      {
        $group: {
          _id: {
            languageId: "$language._id",
            languageName: "$language.name",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          languageId: "$_id.languageId",
          languageName: "$_id.languageName",
          count: 1,
        },
      },
    ]);

    if (!allFilters || allFilters.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No filters found!",
      });
    }

    const finalData = {
      ...allFilters[0],
      productCountPerLanguage,
    };

    return res.status(200).json({
      success: true,
      data: finalData,
      message: "Filters with price range and product count per language fetched successfully!",
    });
  } catch (error) {
    console.error("Error in getAllFilters:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};



const filterProducts = async (req, res) => {
  try {
    let { selectedProducts } = req.query;

    if (!selectedProducts) {
      selectedProducts = [];
    } else if (typeof selectedProducts === "string") {
      selectedProducts = selectedProducts.split(",");
    } else if (!Array.isArray(selectedProducts)) {
      selectedProducts = [selectedProducts];
    }

    selectedProducts = selectedProducts.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    console.log("Cleaned selectedProducts:", selectedProducts);

    const matchStage = {};

    if (selectedProducts.length > 0) {
      matchStage._id = {
        $in: selectedProducts.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const pipeline = [
      { $match: matchStage },
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
          oldPrice: 1,
          categoryId: "$category._id",
          categoryName: "$category.name",
        },
      },
    ];

    const filteredProducts = await products.aggregate(pipeline);

    if (!filteredProducts.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for selected filters!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Filtered products fetched successfully!",
      data: filteredProducts,
    });
  } catch (error) {
    console.error(" Filter Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getFirstTwoCategories = async (req, res) => {
  try {
    const allCategories = await category.find().sort({ createdAt: 1 }).limit(2);

    if (!allCategories || allCategories.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Categories not found!" });
    }

    return res.status(200).json({
      success: true,
      data: allCategories,
      message: "First two categories fetched successfully!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const createCategories = async (req, res) => {
  try {
    const { name } = req.body;

    const addedCategory = await category.create({
      name: name,
    });

    if (!addedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category is not created successfully!",
      });
    }

    return res
      .status(201)
      .json({ success: true, message: "Category created successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt:desc" } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = { [key]: order === "asc" ? 1 : -1 };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const getCategories = await category
      .find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    if (!getCategories) {
      return res
        .status(400)
        .json({ success: false, message: "Categories not found!" });
    }

    const totalCategories = await category.countDocuments(getCategories);
    const totalPages = Math.ceil(totalCategories / limitNumber);

    return res.status(200).json({
      success: true,
      data: getCategories,
      totalCategories,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      message: "Categories are fetched successfully!",
    });
  } catch (error) {
    return res.status(200).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { name } = req.body;

    const isCategoryAvailable = await category.findById(categoryId);
    if (!isCategoryAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "This category is not available!" });
    }

    const updatedCategory = await category.updateOne(
      { _id: categoryId },
      { $set: { name } }
    );

    if (!updatedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category not updated successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category updated successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    const isCategoryAvailable = await category.findById(categoryId);
    if (!isCategoryAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "This category is not available!" });
    }

    
    const isCategoryAvailableInProduct = await products.aggregate([
       {
           $match : {categoryId: new mongoose.Types.ObjectId(categoryId)}
       }
    ])

    if(isCategoryAvailableInProduct.length > 0){
       return res.status(400).json({ success: false, message: "Product of this category is already available!"})
    }

    const deletedCategory = await category.deleteOne({ _id: categoryId });
    if (!deletedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category not deleted successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category deleted successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllFilters,
  createCategories,
  getFirstTwoCategories,
  getAllCategories,
  filterProducts,
  updateCategory,
  deleteCategory,
};
