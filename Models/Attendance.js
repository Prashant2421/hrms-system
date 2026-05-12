import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  date: {
    type: String
  },

  checkIn: Date,
  checkOut: Date,

  totalHours: Number,

  location: {          //company location details
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "On Leave", "Remote","half-day"],
    default: "Present"
  }

}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);