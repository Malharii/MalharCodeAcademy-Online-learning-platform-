const Coures = require("../models/Coures");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create course handler
exports.createCourse = async (req, res) => {
  try {
    const { couresName, couresDescription, category, whatYouWillLearn, price } = req.body;

    const thumbnail = req.files.thumbnailImage;
    if (!couresName || !couresDescription || !category || !whatYouWillLearn || !price) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("instructor details", instructorDetails);
    if (!instructorDetails) {
      return res
        .status(400)
        .json({ success: false, message: "instructor details is  not found" });
    }

    // check given Category is vaild or not
    const CategoryDetails = await Category.findById(Category);
    if (!CategoryDetails) {
      return res
        .status(400)
        .json({ success: false, message: "Categorydetails is  not found" });
    }

    // upload Image top Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    // create an entry for new course
    const newCourse = await Coures.create({
      couresName,
      couresDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      thumbnail: thumbnailImage.secure_url,
      Category: CategoryDetails._id,
    });

    // add new course to the user schema of instructor

    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      { $push: { courses: newCourse._id } },
      { new: true }
    );
    // upadate the Category schema
    await Category.findByIdAndUpdate(
      { _id: CategoryDetails._id },
      { $push: { course: newCourse._id } },
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Course created successfully", data: newCourse });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// get all courses handler

exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Coures.find(
      {},
      {
        couresName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReview: true,
        studentsEnrolled: true,
      }
    )
      .popolulate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "Data for all courses  featched successfully",
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Canot not featch courses",
      error: error.message,
    });
  }
};
