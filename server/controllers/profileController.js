import User from "../models/User.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Could not load profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const fields = ["name", "bio", "phone", "location", "headline", "github", "linkedin", "portfolio"];
    const updates = {};

    for (const field of fields) {
      if (typeof req.body[field] === "string") updates[field] = req.body[field].trim();
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile saved successfully", user });
  } catch {
    res.status(500).json({ message: "Could not save profile" });
  }
};
