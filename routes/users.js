const { getAllUsers } = require("../controllers/users");
const authorization = require("../middlewares/authorization");

const router = require("express").Router();

router.get("/getAllUsers", authorization(["Admin"]), getAllUsers);
module.exports = router;
