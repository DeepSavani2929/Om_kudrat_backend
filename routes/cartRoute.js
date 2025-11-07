const {
  deleteCartProduct,
  addToCart,
  getCartProducts,
  incrementQuantity,
  decrementQuantity,
} = require("../controllers/cartController");

const authorization = require("../middlewares/authorization.js");

const router = require("express").Router();

router.post("/addIntoTheCart/:id", authorization(["User"]), addToCart);
router.get(
  "/getAllProductsAvailableInCart",
  authorization(["User"]),
  getCartProducts
);
router.delete(
  "/deleteProductFromTheCart/:id",
  authorization(["User"]),
  deleteCartProduct
);
router.put(
  "/incrementQuantity/:id",
  authorization(["User"]),
  incrementQuantity
);
router.put(
  "/decrementQuantity/:id",
  authorization(["User"]),
  decrementQuantity
);

module.exports = router;
