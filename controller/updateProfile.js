import User from "../Models/User.js";
export const updateProfile = async (req, res) => {
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.email !== undefined) updates.email = req.body.email;
  if (req.body.position !== undefined) updates.position = req.body.position;
  if (req.body.address !== undefined) updates.address = req.body.address;
  if (req.body.description !== undefined)
    updates.description = req.body.description;
  if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  res.json({ message: "Profile updated successfully", user });
};
