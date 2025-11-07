const router = require("express").Router();

const {
  addLanguages,
  getAllLanguages,
  updateLanguage,
  deleteLanguage,
} = require("../controllers/languages");
const authorization = require("../middlewares/authorization");

router.post("/addLanguage", authorization(["Admin"]), addLanguages);
router.get("/getAllLanguages", getAllLanguages);
router.put(
  "/updateLanguage/:languageId",
  authorization(["Admin"]),
  updateLanguage
);
router.delete(
  "/deleteLanguage/:languageId",
  authorization(["Admin"]),
  deleteLanguage
);

module.exports = router;
