const users = require("../models/auth.js");

const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 9, sort = "createdAt:desc" } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = { [key]: order === "asc" ? 1 : -1 };
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const getUsers = await users
      .find({ role: "User" })
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .select("-password");

    const totalUsers = await users.countDocuments({ role: "User" });
    const totalPages = Math.ceil(totalUsers / limitNumber);

    if (!getUsers || getUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registered users found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: getUsers,
      totalUsers,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,

      message: "Registered users fetched successfully!",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

module.exports = {
  getAllUsers,
};
