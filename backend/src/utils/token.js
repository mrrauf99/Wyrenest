import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export const generateToken = (tokenName, payload) => {
  const secret =
    tokenName === "access" ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
  const expiry = tokenName === "access" ? "15m" : "10d";

  const token = jwt.sign(payload, secret, { expiresIn: expiry });
  return token;
};

export const generateAccessAndRefreshTokens = (payload) => {
  const accessToken = generateToken("access", payload);
  const refreshToken = generateToken("refresh", payload);

  return { accessToken, refreshToken };
};

export const verifyToken = (tokenName, token) => {
  const secret =
    tokenName === "access" ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
  return jwt.verify(token, secret);
};

export const hashRefreshToken = (token) => {
  return crypto
    .createHmac("sha256", process.env.REFRESH_TOKEN_HASH_SECRET)
    .update(token)
    .digest("hex");
};

export const generateRawToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const hashVerificationToken = (token) => {
  return crypto
    .createHmac("sha256", process.env.EMAIL_TOKEN_HASH_SECRET)
    .update(token)
    .digest("hex");
};
