import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import transporter from "../config/nodemailer.js";
import {
  EMAIL_VERIFY_TEMPLATE,
  PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplates.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Send welcome email logic can be added here
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: newUser.email,
      subject: "Welcome to Our Platform!",
      text: `Hello ${newUser.name},\n\nThank you for registering at our platform. We're excited to have you on board!\n\nBest regards,\nThe Team`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "Registration Successful" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Registration Failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, message: "Login Successful" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Login Failed",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logout Successful" });
  } catch (error) {
    return res.json({
      success: false,
      message: "Logout Failed",
      error: error.message,
    });
  }
};

// Send Verify OTP
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Account Verification OTP",
      // text: `Hello ${user.name},\n\nYour OTP for account verification is: ${otp}\nThis OTP is valid for 24 hours.\n\nBest regards,\nThe Team`,
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "OTP sent to your email for account verification",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify Email using OTP
export const verifyAccount = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Account Verification Failed",
      error: error.message,
    });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "User is authenticated",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Authentication check failed",
      error: error.message,
    });
  }
};

// Send password reset OTP
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Your Password Reset OTP",
      // text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nThis OTP is valid for 15 minutes.\n\nBest regards,\nThe Team`,
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
        "{{email}}",
        user.email
      ),
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Failed to send password reset OTP",
      error: error.message,
    });
  }
};

// Reset password using OTP
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    // Validate OTP
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    // Check OTP expiry
    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired" });
    }
    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    user.resetOtp = "";
    user.resetOtpExpiry = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Password Reset Failed",
      error: error.message,
    });
  }
};
