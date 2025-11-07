const express = require("express");
const router = express.Router();
const webHookForPayment = require("../controllers/webHookController.js");

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  
  webHookForPayment
);

module.exports = router;
