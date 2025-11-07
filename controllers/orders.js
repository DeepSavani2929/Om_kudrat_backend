const orders = require("../models/orders");

const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      sort = "createdAt:desc",
      minAmount,
      maxAmount,
    } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = {};
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const matchStage = {};
    if (minAmount || maxAmount) {
      matchStage.totalAmount = {};
      if (minAmount) matchStage.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) matchStage.totalAmount.$lte = parseFloat(maxAmount);

    }

    const allOrders = await orders.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: "$users" },
      {
        $addFields: {
          name: "$users.name",
          email: "$users.email",
        },
      },
      { $project: { users: 0 } },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limitNumber },
    ]);

    const totalCount = await orders.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCount / limitNumber);

    if (!allOrders || allOrders.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Orders not Found!" });
    }

    return res.status(200).json({
      success: true,
      data: allOrders,
      totalOrders: totalCount,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      message: "Orders fetched successfully!",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllOrders,
};
