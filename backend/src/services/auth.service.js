import { OAuth2Client } from "google-auth-library";
import { RefreshToken } from "../models/refreshToken.model.js";
import { VerificationToken } from "../models/verificationToken.model.js";
import {
  generateRawToken,
  hashVerificationToken,
  generateAccessAndRefreshTokens,
  hashRefreshToken,
  verifyToken,
} from "../utils/token.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export const issueAuthTokens = async ({ userId, email, name, role }) => {
  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    userId,
    email,
    name,
    role,
  });

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  await RefreshToken.create({ userId, tokenHash: hashedRefreshToken });
  return { accessToken, refreshToken };
};

export const verifyGoogleCredential = async (credential) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload();
};

export const createVerificationToken = async ({ userId, purpose }) => {
  await VerificationToken.deleteMany({ userId, purpose });

  const rawToken = generateRawToken();

  await VerificationToken.create({
    userId,
    purpose,
    tokenHash: hashVerificationToken(rawToken),
  });

  return rawToken;
};

export const findValidToken = async ({ token, purpose }) => {
  const tokenHash = hashVerificationToken(token);

  return VerificationToken.findOne({
    tokenHash,
    purpose,
    expiresAt: { $gt: new Date() },
  }).select("userId");
};

export const rotateRefreshToken = async (token) => {
  const { userId, email, name, role } = verifyToken("refresh", token);
  const hashedIncomingToken = hashRefreshToken(token);

  const refreshTokenDoc = await RefreshToken.findOne({
    userId,
    tokenHash: hashedIncomingToken,
    expiresAt: { $gt: new Date() },
  });

  if (!refreshTokenDoc) {
    throw new Error("Invalid refresh token");
  }

  const { accessToken, refreshToken } = generateAccessAndRefreshTokens({
    userId,
    email,
    name,
    role,
  });

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  refreshTokenDoc.tokenHash = hashedRefreshToken;
  refreshTokenDoc.expiresAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000); // 10 days
  await refreshTokenDoc.save();

  return { accessToken, refreshToken };
};
