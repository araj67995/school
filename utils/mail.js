const nodemailer = require("nodemailer");
require("dotenv").config(); // Make sure .env variables are available

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendPasswordStudent(id, name, pass, email) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Student ID and Login Credentials",
    html: `
          <p>Dear ${name},</p>
          <p>Welcome to <strong>S.R Public School</strong>!</p>
          <p>Here are your login credentials to access the student portal:</p>
          <ul>
            <li><strong>Student ID:</strong> ${id}</li>
            <li><strong>Password:</strong> ${pass}</li>
          </ul>
          <p>Please make sure to keep this information confidential and do not share it with others.</p>
          <p>You can log in at: <a href="https://your-school-portal.com/login">your-school-portal.com/login</a></p>
          <br>
          <p>Best regards,<br><strong>S.R Public Administration</strong></p>
        `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordTeacher(id, email, pass, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Teacher ID and Login Credentials",
    html: `
          <p>Dear ${name},</p>
          <p>Welcome to <strong>S.R Public School</strong>!</p>
          <p>Here are your login credentials to access the login portal:</p>
          <ul>
            <li><strong>Teacher ID:</strong> ${id}</li>
            <li><strong>Password:</strong> ${pass}</li>
          </ul>
          <p>Please keep this information confidential and do not share it with others.</p>
          <p>Login here: <a href="https://your-school-portal.com/login">your-school-portal.com/login</a></p>
          <br>
          <p>Best regards,<br><strong>S.R Public Administration</strong></p>
        `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { transporter, sendPasswordStudent, sendPasswordTeacher };
