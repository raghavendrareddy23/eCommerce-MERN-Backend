const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {
  sendResetPasswordEmail,
  sendSuccessResetEmail,
} = require("../utils/resetpassword");

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!req.body.username) {
      return res
        .status(400)
        .json({ success: false, message: "User name is required" });
    }
    if (!req.body.email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    if (!req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "email already exists" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special symbol",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!req.body.username) {
      return res
        .status(400)
        .json({ success: false, message: "User name is required" });
    }

    if (!req.body.password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let role = "user";
    if (user.role === "admin") {
      role = "admin";
    }

    if (role === "admin") {
      await adminLogin(req, res, user, password);
    } else {
      await userLogin(req, res, user, password);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const userLogin = async (req, res, user, password) => {
  try {
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: "user" },
      process.env.JWT_SECRET
    );

    res
      .status(200)
      .json({ userId: user._id, token, username: user.username, role: "user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const adminLogin = async (req, res, user, password) => {
  try {
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: "admin" },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token, username: user.username, role: "admin" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!req.body.email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1m",
    });
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60000;

    await user.save();

    const resetLink = `https://rr-ecommerce-web.netlify.app/user/reset-password?token=${token}`;

    await sendResetPasswordEmail(user.email, resetLink);

    res.status(200).json({
      message: "Reset password email sent successfully",
      resetLink,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!req.body.token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });
    }
    if (!req.body.newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New PasswordconfirmPassword is required" });
    }
    if (!req.body.confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Confirm Password is required" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one digit, and one special symbol",
      });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const isSameAsOldPassword = await bcrypt.compare(
      newPassword,
      user.password
    );
    if (isSameAsOldPassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await sendSuccessResetEmail(user.email, "Password reset successfully");

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;
  const { id } = req.params;

  if ((!oldPassword, !newPassword, !confirmNewPassword)) {
    return res.status(422).json({
      message: "oldPassword, newPassword and confirmNewPassword are required.",
    });
  }

  try {
    const validateUser = await User.findById({ _id: id });

    const isMatch = await bcrypt.compare(oldPassword, validateUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old Password is incorrect" });
    }

    if (newPassword !== confirmNewPassword) {
      return res
        .status(400)
        .json({ message: "New password and Confirm Password do not match" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    validateUser.password = hashedPassword;

    await validateUser.save();

    return res.status(200).json({
      success: true,
      message: `Password Changed for ${validateUser.email} Successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Password Change Failed for ${validateUser.email}!`,
      error,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching Users",
    });
  }
};
