const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    blogTitle: {
      type: String,
      required: true,
      trim: true,
    },

    blogSlug: {
      type: String,
      required: true,
      trim: true, 
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },

    blogImage: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
