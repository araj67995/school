const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: String,
    date: String,
    status: String,
    remark: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notices", noticeSchema);

