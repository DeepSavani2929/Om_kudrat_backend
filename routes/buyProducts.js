const router = require("express").Router();
const authorization = require("../middlewares/authorization");
const buyProducts = require("../controllers/buyProducts.js");

router.post("/createPaymentIntent", authorization(["User"]), buyProducts);

module.exports = router;
