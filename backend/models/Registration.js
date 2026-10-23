const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254
    },

    college: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    year: {
      type: String,
      required: true,
      enum: [
        "1st year",
        "2nd year",
        "3rd year",
        "4th year",
        "Other"
      ]
    },

    event: {
      type: String,
      required: true,
      enum: [
        "Web Dev Kickstart",
        "CodeSprint Challenge",
        "TechTalk & Connect",
        "General chapter membership"
      ]
    },

    interest: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Registration",
  registrationSchema
);