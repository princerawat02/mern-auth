import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.body) req.body = {};

    req.body.userId = decoded.userId;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: error.message || "Unauthorized" });
  }
};

export default userAuth;
