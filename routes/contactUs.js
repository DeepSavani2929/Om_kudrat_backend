const router = require("express").Router()
const { addCustomerContactDetails, getCustomerContactDetails } = require("../controllers/contactUs");
const authorization = require("../middlewares/authorization");

router.post("/addCustomerContactDetails",  addCustomerContactDetails)
router.get("/getCustomerContactDetails", authorization(['Admin']), getCustomerContactDetails)

module.exports = router;