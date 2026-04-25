const mongoose = require("mongoose");

const { Schema } = mongoose;

const attendanceListSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: { type: String, required: true },
    branch: { type: String, required: true },
    batch: { type: String, required: true },
    semester: { type: String, required: true },

    students: [
      {
        name: { type: String, required: true },
        registrationNumber: { type: String, required: true },

        attendance: [
          {
            date: { type: String, required: true },
            status: {
              type: String,
              enum: ["Present", "Absent"],
              required: true,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AttendanceList", attendanceListSchema);