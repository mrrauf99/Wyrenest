import { verifyToken } from "../utils/token.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const { accessToken } = req.cookies;
    const decodedToken = verifyToken("access", accessToken);
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};
