require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");

const admissionRoutes = require("./routes/admission");
const forgetRoutes = require("./routes/forget");
const homeRoutes = require("./routes/home");
const loginRoutes = require("./routes/login");
const studentRoutes = require("./routes/student");
const teacherRoutes = require("./routes/teacher");

const adminRoutes = require("./routes/admin/dashboard");
const adminAdmissionRoutes = require("./routes/admin/admission");
const adminStudentRoutes = require("./routes/admin/student");
const adminTeacherRoutes = require("./routes/admin/teacher");
const adminNoticeRoutes = require("./routes/admin/notice");
const adminPaymentsRoutes = require("./routes/admin/payment");
const { setUserData } = require("./utils/auth");

const app = express();

mongoose.connect("mongodb://localhost:27017/school", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Session configuration
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Global middleware to set user data
app.use(setUserData);

// Mount routes
app.use("/", homeRoutes);
app.use("/admission", admissionRoutes);
app.use("/forget", forgetRoutes);
app.use("/login", loginRoutes);
app.use("/student", studentRoutes);
app.use("/teacher", teacherRoutes);

app.use("/admin", adminRoutes); // dashboard
app.use("/admin/admission", adminAdmissionRoutes);
app.use("/admin/student", adminStudentRoutes);
app.use("/admin/teacher", adminTeacherRoutes);
app.use("/admin/notice", adminNoticeRoutes);
app.use("/admin/payments", adminPaymentsRoutes);

// Optional 404 and error handlers
app.use((req, res, next) => {
  res.status(404).render("404", { url: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is started on port 3000!!");
});
