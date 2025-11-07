const mongoose = require("mongoose");
const languageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const language = mongoose.model("language", languageSchema);
module.exports = language;
