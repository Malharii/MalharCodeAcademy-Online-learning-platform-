const mongoose = require("mongoose");

const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  timeDuaration: {
    type: String,
  },
  description: {
    type: String,
  },
  videUrl: {
    type: String,
  },
});

module.exports = mongoose.model("SubSection", subSectionSchema);
