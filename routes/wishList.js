const {
  getWishList,
  addedWishList,
  deleteWishListProduct,
  getProductFromTheWishList,
} = require("../controllers/wishList");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.post(
  "/addProductIntoWishList/:id",
  authorization(["User"]),
  addedWishList
);
router.get("/getWishList", authorization(["User"]), getWishList);
router.get(
  "/getProductFromTheWishList/:id",
  authorization(["User"]),
  getProductFromTheWishList
);
router.delete(
  "/deleteProductFromTheWishList/:id",
  authorization(["User"]),
  deleteWishListProduct
);

module.exports = router;
