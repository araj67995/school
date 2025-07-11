const mongoose = require('mongoose');
const { formatDateToDDMMYYYY } = require('../utils/date'); // from model or route

// Teacher Schema
const teacherSchema = new mongoose.Schema(
  {
    teacherId: String,
    name: String,
    dob: String,
    gender: String,
    email: String,
    contact: String,
    address: String,
    grade: String,
    section: String,
    previousWorking: String,
    father: String,
    mother: String,
    experience: Number,
    salary: Number,
    subject: String,
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

const Teacher = mongoose.model("Teachers", teacherSchema);

// Teacher daily attendance schema
const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      required: true,
    },
    remark: String,
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const TeacherAttendance = mongoose.model(
  "TeacherAttendance",
  teacherAttendanceSchema
);

// Teacher leave schema
const teacherLeaveSchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    fromDate: { type: String, required: true }, // YYYY-MM-DD
    toDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remark: String,
  },
  { timestamps: true }
);

const TeacherLeave = mongoose.model("TeacherLeave", teacherLeaveSchema);

// Teacher salary schema
const teacherSalarySchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    month: { type: String, required: true }, // YYYY-MM
    year: { type: Number, required: true },
    basicSalary: { type: Number, required: true },
    allowances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Check"],
      default: "Bank Transfer",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },
    paymentDate: String,
    remarks: String,
    attendanceDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    halfDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    createdAt: {
      type: String,
      default: () => formatDateToDDMMYYYY(new Date())
    },
  },
  { timestamps: true }
);

const TeacherSalary = mongoose.model("TeacherSalary", teacherSalarySchema);

const teacherCounterSchema = new mongoose.Schema({
  year: Number,
  count: Number,
});

const TeacherCounter = mongoose.model("TeacherCounter", teacherCounterSchema);

module.exports = {
    Teacher,
    TeacherAttendance,
    TeacherLeave,
    TeacherSalary,
    TeacherCounter
};