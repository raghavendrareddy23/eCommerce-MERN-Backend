const mongoose = require("mongoose");
const { none } = require("../utils/multer");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false, default: '' },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    token:{type:String, default: none},
    resetPasswordToken: String,
    resetPasswordExpires: Date
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", userSchema);
