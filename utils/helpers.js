const {ReciptNo, Counter, RollNo} = require("../models/student");
const {TeacherCounter} = require("../models/teacher");

// Helper to format date as DD-MM-YYYY
function formatDateToDDMMYYYY(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

// Generate Recipt
async function generateRecipt(date) {
   const d = date.getDate().toString().padStart(2, "0");
   const m = (date.getMonth() + 1).toString().padStart(2, "0");
   const year = date.getFullYear();

   const counter =  await ReciptNo.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
   );

  const number = String(counter.count).padStart(3, "0");
  return `${year}${m}${d}${number}`
}

// Generate Student ID
async function generateStudentId() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(4, "0");
  return `SR${year}${number}`;
}

// Genereate Student Roll NO
async function rollnoGenerater(grade) {
  const year = new Date().getFullYear();

  console.log(year);

  // Find all sections for this grade and year, sorted by section
  const records = await RollNo.find({ year, grade }).sort({ section: 1 });

  let section = "A";
  let count = 0;

  if (records.length > 0) {
    const lastRecord = records[records.length - 1];
    section = lastRecord.section;
    count = lastRecord.count;

    if (count >= 30) {
      // If count >= 30, go to next section
      section = String.fromCharCode(section.charCodeAt(0) + 1);
      count = 0;
    }
  }

  // Now increment count
  const counter = await RollNo.findOneAndUpdate(
    { year, grade, section },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(2, "0");
  return `${section}, ${number}`; // returns like A01, B01 etc.
}

// Generate Teacher Id
async function genrateTeacherId() {
  const year = new Date().getFullYear();

  const counter = await TeacherCounter.findOneAndUpdate(
    { year },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  const number = String(counter.count).padStart(2, "0");
  return `SR${year}T${number}`;
}

// Function to generate credentials
function generateCredentials(id) {
  const username = id; // enrollment no
  const password = Math.random().toString(36).slice(-8); // random 8-char password

  return password;
}

module.exports = {
  formatDateToDDMMYYYY,
  generateRecipt,
  generateStudentId,
  rollnoGenerater,
  genrateTeacherId,
  generateCredentials
};
