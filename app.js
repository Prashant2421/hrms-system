import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/Db.js";
import authRoutes from "./Routes/authRoutes.js";
import attendanceRoutes from "./Routes/attendenceRoutes.js";
import salaryRoutes from "./Routes/salaryRoutes.js";
import paySlipRoutes from "./Routes/payslipRoutes.js";
import userRoutes from "./Routes/userRoutes.js";

dotenv.config();
connectDB();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" })); //to parse JSON bodies
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/payslip", paySlipRoutes);
app.use("/api/users", userRoutes);

export default app;
