const nodemailer = require("nodemailer");
require("dotenv").config(); // Make sure .env variables are available

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAdmissionDetails(name, email) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Admission Application Received - S.R Public School",
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for applying for admission at <strong>S.R Public School</strong>.</p>
        <p>We have received your application and our admissions team will review it shortly.</p>
        
        <p><strong>Next Steps:</strong></p>
        <p>Please visit the school between <strong>9:00 AM to 2:00 PM</strong> on working days.</p>
        <p>Bring the following required documents:</p>
        <ul>
          <li>Recent passport-size photographs</li>
          <li>Valid photo ID proof (Aadhar card, passport, etc.)</li>
          <li>Any other essential documents related to admission</li>
        </ul>

        <p>For any queries, contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>.</p>
        <br/>
        <p>Regards,<br/>
        Admissions Office<br/>
        S.R Public School</p>
      `
  }
  await transporter.sendMail(mailOptions);
}

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

async function sendPasswordChangeOtp(email, otp, name) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Change OTP – S.R Public School",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f8fb; padding: 32px;">
        <div style="max-width: 480px; background: #fff; border-radius: 8px; margin: auto; box-shadow: 0 2px 8px #eef1f6; padding: 28px 28px 18px;">
          <h2 style="color: #3874CB; margin-block-end: 4px;">Password Change Request</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>
            We received a request to change the password for your S.R Public School account.<br>
            <strong>Please use the following OTP to proceed:</strong>
          </p>
          <div style="text-align:center;">
            <p style="font-size: 22px; letter-spacing: 4px; color: #2d4663; font-weight: bold; margin: 16px 0 20px;">
              ${otp}
            </p>
          </div>
          <p>
            Enter this OTP on the password change page. The OTP will be valid for the next <strong>10 minutes</strong>.<br>
            If you did not initiate this request, please ignore this email or contact us immediately.
          </p>
          <p>
            For your security, do not share this code with anyone.<br><br>
            Regards,<br>
            <strong>S.R Public School Administration</strong>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}


module.exports = { transporter,sendAdmissionDetails, sendPasswordStudent, sendPasswordTeacher, sendPasswordChangeOtp };
