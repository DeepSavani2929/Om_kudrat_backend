require("dotenv").config();
require("./config/dbConnect.js");
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 4000;
const router = require("./routes/index.js");
const stripeWebhook = require("./routes/stripeWebhook.js");
app.use("/stripe", stripeWebhook);
app.use(cors());

app.use(express.json());
app.use(cookieParser());
app.use("/api", router);
app.use("/images", express.static("public/images"));

app.listen(port, () => {
  console.log(`Server started at ${port}`);
});
