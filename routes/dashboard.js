const router = require("express").Router();
const authorization = require("../middlewares/authorization");
const { getDashboardData } = require("../controllers/dashboard");

router.get("/dashboardData", authorization(['Admin']), getDashboardData)

module.exports = router;
