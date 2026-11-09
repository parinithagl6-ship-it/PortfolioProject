import User from "../models/User.js";

export const getPortfolio = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("skills projects certificates");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ skills: user.skills, projects: user.projects, certificates: user.certificates });
  } catch {
    res.status(500).json({ message: "Could not load portfolio" });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const { skills, projects, certificates } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, {
      $set: {
        skills: Array.isArray(skills) ? skills : [],
        projects: Array.isArray(projects) ? projects : [],
        certificates: Array.isArray(certificates) ? certificates : []
      }
    }, { new: true, runValidators: true }).select("skills projects certificates");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Portfolio saved successfully", skills: user.skills, projects: user.projects, certificates: user.certificates });
  } catch {
    res.status(500).json({ message: "Could not save portfolio" });
  }
};
