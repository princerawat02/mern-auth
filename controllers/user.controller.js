import User from "../models/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select(
      "-password -verifyOtp -verifyOtpExpiry -resetOtp -resetOtpExpiry"
    );
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
      }
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Failed to fetch user data",
      error: error.message,
    });
  }
};
