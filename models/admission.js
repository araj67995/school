const mongoose = require('mongoose');
const { formatDateToDDMMYYYY, capitalizeWords} = require('../utils/date');

const admissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      set: capitalizeWords
    },
    lastname: {
      type: String,
      set: capitalizeWords
    },
    dob: Date,
    gender: String,
    email: String,
    phone: String,
    address: String,
    grade: String,
    previousSchool: String,
    parent: {
      type: String,
      set: capitalizeWords
    },
    mother: {
      type: String,
      set: capitalizeWords
    },
    parentNo: String,
    parentEmail: String,
    document: [String],
    status: { type: String, default: "Pending" },
    createdAt: {
      type: String,
      default: () => formatDateToDDMMYYYY(new Date())
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admissions", admissionSchema);
