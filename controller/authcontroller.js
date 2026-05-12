import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import user from "../Models/User.js";
export const register = async (req, res) => {
  const { name, email, password, role, position } = req.body;

  const exist = await user.findOne({ email });
  if (exist) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedpassword = await bcrypt.hash(password, 10);
  await user.create({
    name,
    email,
    password: hashedpassword,
    position,
    role: "employee",
  });
  res.status(201).json({ message: "User created successfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  const exist = await user.findOne({ email });
  if (!exist) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, exist.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: exist._id,
      role: exist.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  res.status(200).json({ message: "Login successful", token });
};
