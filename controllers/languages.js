const language = require("../models/languages");
const products = require("../models/products");
const mongoose = require("mongoose")

const addLanguages = async (req, res) => {
  try {
    const { name } = req.body;

    const addedLanguage = await language.create({
      name,
    });

    if (!addedLanguage) {
      return res
        .status(400)
        .json({ success: false, message: "language not added!" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Language added successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getAllLanguages = async (req, res) => {
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

    const getLanguages = await language
      .find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    if (!getLanguages) {
      return res
        .status(400)
        .json({ success: false, message: "Languages are not found!" });
    }

    const totalLanguages = await language.countDocuments(getLanguages);
    const totalPages = Math.ceil(totalLanguages / limitNumber);

    return res.status(200).json({
      success: true,
      data: getLanguages,
      totalLanguages,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      message: "Languages are fetched successfully!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const updateLanguage = async (req, res) => {
  try {
    const languageId = req.params.languageId;
    const { name } = req.body;

    const isLanguageAvailable = await language.findById(languageId);
    if (!isLanguageAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "This language is not available!" });
    }

    console.log(name);
    const updatedLanguage = await language.updateOne(
      { _id: languageId },
      { $set: { name } }
    );

    if (!updatedLanguage) {
      return res.status(400).json({
        success: false,
        message: "Language not updated successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Language updated successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const deleteLanguage = async (req, res) => {
  try {
    const languageId = req.params.languageId;

    const isLanguageAvailable = await language.findById(languageId);
    if (!isLanguageAvailable) {
      return res
        .status(400)
        .json({ success: false, message: "This language is not available!" });
    }

    const isLanguagePresentInProduct = await  products.aggregate([
       {
           $match : {languageId: new mongoose.Types.ObjectId(languageId)}
       }
    ])

    if(isLanguagePresentInProduct.length > 0){
       return res.status(400).json({ success: false, message: "Product of this language is already available!"})
    }

    const deleteLanguage = await language.deleteOne({ _id: languageId });
    if (!deleteLanguage) {
      return res.status(400).json({
        success: false,
        message: "language not deleted successfully!",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "language deleted successfully!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addLanguages,
  getAllLanguages,
  updateLanguage,
  deleteLanguage,
};
