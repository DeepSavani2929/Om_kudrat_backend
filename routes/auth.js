const {
  loginUser,
  registerUser,
  changePassword,
  emailVerify,
  otpVerify,
  resetPassword,
} = require("../controllers/auth");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.put("/changePassword", authorization(["User"]), changePassword);
router.post("/emailVerify", emailVerify);
router.post("/otpVerify", otpVerify);
router.put("/resetPassword/:id", resetPassword);

module.exports = router;
