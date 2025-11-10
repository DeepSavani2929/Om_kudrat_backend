const router = require("express").Router();
const {
  getAllProducts,
  createProduct,
  getProduct,
  getProductsBasedOnCategory,
  getBestSellingProducts,
  getTrendingProducts,
  getDealOfTheWeekProduct,
  updatedProduct,
  deleteProduct,
  getAllProductsForDashboard,
} = require("../controllers/products.js");
const multer = require("multer");
const path = require("path");
const authorization = require("../middlewares/authorization.js");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/createProduct",
  authorization(["Admin"]),
  upload.single("image"),
  createProduct
);
router.get("/getProducts", getAllProducts);
router.get("/getAllProductsForDashboard", getAllProductsForDashboard);
router.get("/getProduct/:productSlug", getProduct);
router.get("/getProductsBasedOnCategory", getProductsBasedOnCategory);
router.get("/getBestSellingProducts", getBestSellingProducts);
router.get("/getTrendingProducts", getTrendingProducts);
router.get("/getDealOfTheWeekProduct", getDealOfTheWeekProduct);
router.put(
  "/updateProduct/:productId",
  authorization(["Admin"]),
  upload.single("image"),
  updatedProduct
);
router.delete(
  "/deleteProduct/:productId",
  authorization(["Admin"]),
  deleteProduct
);

module.exports = router;
