const { getAllOrders } = require("../controllers/orders");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.get("/getAllOrders", authorization(["Admin"]), getAllOrders);

module.exports = router;
