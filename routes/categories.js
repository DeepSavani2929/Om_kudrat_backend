const {
  getAllFilters,
  addLanguages,
  createCategories,
  filterProducts,
  getFirstTwoCategories,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categories");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.post("/createCategory", authorization(["Admin"]), createCategories);
router.get("/getFirstTwoCategories", getFirstTwoCategories);
router.get("/getAllFilters", getAllFilters);
router.get("/getFilteredProducts", filterProducts);
router.get("/getAllCategories", getAllCategories);
router.put(
  "/updateCategory/:categoryId",
  authorization(["Admin"]),
  updateCategory
);
router.delete(
  "/deleteCategory/:categoryId",
  authorization(["Admin"]),
  deleteCategory
);

module.exports = router;
