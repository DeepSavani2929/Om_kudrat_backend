const Blog = require("../models/blog");

// const generateSlug = (name) => {
//   return name
//     .toString()
//     .trim()
//     .toLowerCase()
//     .replace(/\s+/g, "-")         
//     .replace(/[^\w\-]+/g, "")     
//     .replace(/\-\-+/g, "-")       
//     .replace(/-+$/, "");        
// };



const createBlog = async (req, res) => {
  try {
    const { blogTitle, blogSlug, shortDescription, content } = req.body;

    const blogImage = req.file ? req.file.filename : null;

    if (!blogTitle || !shortDescription || !blogImage || !content) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    // const blogSlug = generateSlug(blogTitle);

    const addedBlog = await Blog.create({
      blogTitle,
      blogSlug,
      shortDescription,
      blogImage,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully!",
      data: addedBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, sort = "createdAt:desc" } = req.query;

    let sortOptions = { createdAt: -1 };
    if (sort) {
      const [key, order] = sort.split(":");
      sortOptions = {};
      sortOptions[key] = order === "asc" ? 1 : -1;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const blogs = await Blog.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const totalCount = await Blog.countDocuments( );

    const totalPages = Math.ceil(totalCount / limitNumber);

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully!",
      totalBlogs: totalCount,
      currentPage: pageNumber,
      totalPages,
      limit: limitNumber,
      sort: {
        field: Object.keys(sortOptions)[0],
        order: sortOptions[Object.keys(sortOptions)[0]] === 1 ? "asc" : "desc",
      },
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getBlog = async (req, res) => {
  try {
    const { blogSlug } = req.params;
    const particularBlog = await Blog.findOne({ blogSlug: blogSlug});

    if (!particularBlog) {
      return res.status(404).json({
        success: false,
        message: "This blog is not available!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully!",
      data: particularBlog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getOtherBlogs = async (req, res) => {
  try {
    const { blogSlug } = req.params;

    const blogs = await Blog.find({ blogSlug: { $ne: blogSlug } }).limit(4);

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No other blogs found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Other blogs fetched successfully!",
      totalBlogs: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching other blogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const editBlog = async (req, res) => {
  try {
    const { blogSlug } = req.params;
     const { blogTitle,shortDescription, content } = req.body;

    const existingBlog = await Blog.findOne({blogSlug: blogSlug});
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: "This blog is not available!",
      });
    }

 
    console.log(req.body);
    const blogImage = req.file ? req.file.filename : existingBlog.blogImage;

      // const blogSlug = generateSlug(blogTitle);

    const updatedBlog = await Blog.findByIdAndUpdate(
      existingBlog._id,
      { $set: { blogTitle, blogSlug, shortDescription, content, blogImage } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      data: updatedBlog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found!",
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTopThreeRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).limit(3);

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recent blogs found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Top 3 recent blogs fetched successfully!",
      totalBlogs: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching top 3 blogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlog,
  getOtherBlogs,
  editBlog,
  deleteBlog,
  getTopThreeRecentBlogs,
};
