const User = require("../models/auth.js");
const Order = require("../models/orders.js");

const getRangeStart = (range) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch ((range || "month").toLowerCase()) {
    case "today": {
      return new Date(now);
    }

    case "week": {
      const start = new Date(now);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }

    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }

    case "year": {
      const start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }

    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      return start;
    }
  }
};

const getDashboardData = async (req, res) => {
  try {
    const range = (req.query.range || "month").toLowerCase();
    const startDate = getRangeStart(range);
    const now = new Date();

    const usersTillNow = await User.countDocuments({
      role: "User",
      createdAt: { $gte: startDate, $lte: now },
    });

    const usersAllTime = await User.countDocuments({ role: "User" });

    const ordersTillNow = await Order.countDocuments({
      createdAt: { $gte: startDate, $lte: now },
    });

    const ordersAllTime = await Order.countDocuments();

    const revenueTillNowAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: now },
          totalAmount: { $exists: true, $ne: null },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const revenueTillNow = revenueTillNowAgg[0]?.total || 0;

    const revenueAllAgg = await Order.aggregate([
      {
        $match: { totalAmount: { $exists: true, $ne: null } },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const revenueAllTime = revenueAllAgg[0]?.total || 0;

    const start12 = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const salesLast12 = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start12 },
          totalAmount: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      months.push({ label, total: 0, count: 0 });
    }

    for (const row of salesLast12) {
      const label = `${row._id.year}-${String(row._id.month).padStart(2, "0")}`;
      const target = months.find((m) => m.label === label);
      if (target) {
        target.total = row.total;
        target.count = row.count;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        range,
        users: {
          tillNow: usersTillNow,
          allTimeCount: usersAllTime,
        },
        orders: {
          tillNow: ordersTillNow,
          allTimeCount: ordersAllTime,
        },
        revenue: {
          tillNow: revenueTillNow,
          allTimeTotal: revenueAllTime,
        },
        salesLast12Months: months,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

module.exports = {
  getDashboardData,
};
