const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const {
  createBlog,
  getAllBlogs,
  getBlog,
  getOtherBlogs,
  editBlog,
  deleteBlog,
  getTopThreeRecentBlogs,
} = require("../controllers/blog");
const authorization = require("../middlewares/authorization");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/createBlog",
  authorization(["Admin"]),
  upload.single("blogImage"),
  createBlog
);
router.get("/getAllBlogs", getAllBlogs);
router.get("/getBlog/:blogSlug", getBlog);
router.get("/getOtherBlogs/:blogSlug", getOtherBlogs);
router.get("/getTopThreeRecentBlogs", getTopThreeRecentBlogs);
router.put(
  "/updateBlog/:blogSlug",
  authorization(["Admin"]),
  upload.single("blogImage"),
  editBlog
);
router.delete("/deleteBlog/:id", authorization(["Admin"]), deleteBlog);

module.exports = router;
