import { model, Schema } from "mongoose";

const verificationTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ["email_verify", "password_reset"],
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000),
  },
});

verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
verificationTokenSchema.index({ tokenHash: 1, purpose: 1 });
verificationTokenSchema.index({ userId: 1, purpose: 1 });

export const VerificationToken = model(
  "VerificationToken",
  verificationTokenSchema,
);
