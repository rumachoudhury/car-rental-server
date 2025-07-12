// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// export const protect = async (req, res, next) => {
//   const token = req.headers.authorization;
//   if (!token) {
//     return res.json({ success: false, message: "not authorized" });
//   }

//   try {
//     const userId = jwt.decode(token, process.env.JWT_SECRET);

//     if (!userId) {
//       return res.json({ success: false, message: "not authorized" });
//     }
//     req.user = await User.findById(userId).select("-password");
//     next();
//   } catch (error) {
//     return res.json({ success: false, message: "not authorized" });
//   }
// };

// middleware function protect our routes

// -----------
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    // VERIFY the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from decoded _id (we assume the payload looks like { _id: userId })
    req.user = await User.findById(decoded._id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};
