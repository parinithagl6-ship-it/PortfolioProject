import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  headline: { type: String, default: "" },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  portfolio: { type: String, default: "" },
  skills: [{ name: String, level: String }],
  projects: [{ title: String, description: String, technologies: String, github: String, live: String }],
  certificates: [{ title: String, issuer: String, date: String, link: String }]
}, { timestamps: true });

export default mongoose.model("User", userSchema);
