const router = require("express").Router();
const userData = require("./auth.js");
const products = require("./products.js");
const categories = require("./categories.js");
const cartRoute = require("./cartRoute.js");
const wishListRoute = require("./wishList.js");
const buyProducts = require("./buyProducts.js");
const blogs = require("./blog.js");
const users = require("./users.js");
const languages = require("./languages");
const orders = require("./orders");
const dashboard = require("./dashboard.js")

router.use("/auth", userData);
router.use("/products", products);
router.use("/categories", categories);
router.use("/languages", languages);
router.use("/cart", cartRoute);
router.use("/wishList", wishListRoute);
router.use("/buyAllCartProducts", buyProducts);
router.use("/blog", blogs);
router.use("/orders", orders);
router.use("/users", users);
router.use("/dashboard", dashboard)

module.exports = router;
