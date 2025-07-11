const mongoose = require('mongoose');
const { formatDateToDDMMYYYY } = require('../utils/date');

const admissionSchema = new mongoose.Schema(
  {
    name: String,
    lastname: String,
    dob: Date,
    gender: String,
    email: String,
    phone: String,
    address: String,
    grade: String,
    previousSchool: String,
    parent: String,
    mother: String,
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
