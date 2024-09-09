const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ success: false, message: "All fields is required" });
    }
    const CategoryDetails = await Category.create({
      name: name,
      description: description,
    });

    return res
      .status(200)
      .json({ success: true, message: "Category created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get all Category
exports.showAllCategory = async (req, res) => {
  try {
    const allCategory = await Category.find({}, { name: true, description: true });

    return res
      .status(200)
      .json({ success: true, message: "All Categoryreturn successfully", allCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
