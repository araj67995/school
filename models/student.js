const mongoose = require('mongoose');
const { formatDateToDDMMYYYY } = require('../utils/date');

// Student Schema
const studentSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    name: String,
    dob: String,
    gender: String,
    email: String,
    phone: String,
    address: String,
    grade: String,
    rollno: Number,
    section: String,
    previousSchool: String,
    parentName: String,
    mother: String,
    parentPhone: String,
    parentEmail: String,
    document: [String],
    transport: String,
    status: {
      type: String,
      default: "Active",
    },
    joiningDate: {
     type: String,
      default: () => formatDateToDDMMYYYY(new Date())
    },
  },
  { timestamps: true }
);

const Student = mongoose.model("Students", studentSchema);

const feeSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    name: String,
    father: String,
    grade: String,
    receiptNo: String,
    month: String,
    year: String,
    tuition: Number,
    transport: Number,
    exam: Number,
    other: Number,
    total: Number,
    feeType: [String], // ✅ ensure this is an array
    methods: [String], // ✅ ensure this is an array
    status: String,
    createdAt: {
      type: String,
      default: () => formatDateToDDMMYYYY(new Date())
    },
  },
  { timestamps: true }
);

const Fee = mongoose.model("Fee", feeSchema);

const attendenceSchema = new mongoose.Schema(
  {
    enrollmentNo: String,
    month: String,
    present: Number,
    absent: Number,
    percentage: String,
    remark: String,
  },
  { timestamps: true }
);

const Attendance = mongoose.model("Attendance", attendenceSchema);

const subjectSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    theory: { type: Number, required: true },
    practical: { type: Number, required: true },
    total: { type: Number, required: true },
    grade: [{ type: String, required: true }],
  },
  { _id: true }
);

const marksSchema = new mongoose.Schema({
  enrollmentNo: { type: String, required: true },
  name: { type: String, required: true },
  fathersName: { type: String },
  grade: { type: String, required: true },
  rollno: { type: String },
  term: { type: String, required: true }, // "term1", "term2", etc.
  subjects: [subjectSchema],
  createdAt: { type: Date, default: Date.now },
});

const Marksheet = mongoose.model("Marksheet", marksSchema);

const counterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const reciptCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const rollCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
  grade: String,
  section: {
    type: String,
    default: "A",
  },
});

const ReciptNo = mongoose.model("Recipt-Counter", reciptCounterSchema);
const Counter = mongoose.model("Counter", counterSchema);
const RollNo = mongoose.model("Roll-Numbers", rollCounterSchema);

module.exports = {
  Student,
  Fee,
  Attendance,
  Marksheet,
  ReciptNo,
  Counter,
  RollNo,
};
