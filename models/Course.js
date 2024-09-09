const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
    trim: true,
  },
  courseDescription: {
    type: String,
    required: true,
    trim: true,
  },
  instructors: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReview: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  studentEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
