import Attendance from "../Models/Attendance.js";
import { OFFICE_LOCATION } from "../Config/location.js";
import { officeTime } from "../Config/officeTime.js";

// Distance function
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;

  const toRad = (val) => (val * Math.PI) / 180; //formulae to convert degrees to radians

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const buildTimeForDate = (baseDate, timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// CHECK-IN
export const checkIn = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ msg: "Location required" });
  }

  const distance = getDistance(
    lat,
    lng,
    OFFICE_LOCATION.lat,
    OFFICE_LOCATION.lng,
  );

  if (distance > OFFICE_LOCATION.radius) {
    return res.status(403).json({
      msg: "Outside office location",
      distance: distance.toFixed(2),
    });
  }
  const now = new Date();
  const officeStart = buildTimeForDate(now, officeTime.start);

  if (now > officeStart) {
    return res.status(403).json({
      msg: "tu late aa raha hai office, jaldi aa",
    });
  }

  const today = new Date().toISOString().split("T")[0];

  const existing = await Attendance.findOne({
    userId: req.user.id,
    date: today,
  });

  if (existing) {
    return res.status(400).json({ msg: "Already aa chuka ho in" });
  }

  const attendance = await Attendance.create({
    userId: req.user.id,
    date: today,
    checkIn: now,
    location: { lat, lng },
  });

  res.json(attendance);
};

// CHECK-OUT
export const checkOut = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const attendance = await Attendance.findOne({
    userId: req.user.id,
    date: today,
  });

  if (!attendance) {
    return res.status(400).json({ msg: "No check-in found" });
  }

  if (attendance.checkOut) {
    return res.status(400).json({ msg: "Already checked out" });
  }

  const checkOutTime = new Date();

  const diffMs = checkOutTime - attendance.checkIn;
  const hours = diffMs / (1000 * 60 * 60);

  const officeStartTime = buildTimeForDate(checkOutTime, officeTime.start);
  const officeEndTime = buildTimeForDate(checkOutTime, officeTime.end);
  const halfDayStart = new Date(officeStartTime.getTime() + 30 * 60 * 1000);
  const halfDayEnd = new Date(officeEndTime.getTime() - 30 * 60 * 1000);

  const isLate = attendance.checkIn > halfDayStart;
  const isEarly = checkOutTime < halfDayEnd;

  attendance.checkOut = checkOutTime;
  attendance.totalHours = hours.toFixed(2);

  if (isLate && isEarly) {
    attendance.status = "half-day";
  }

  await attendance.save();

  res.json(attendance);
};

// GET MY ATTENDANCE
export const getMyAttendance = async (req, res) => {
  const data = await Attendance.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(data);
};
