import { model, Schema } from "mongoose";

const refreshTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  },
});

refreshTokenSchema.index(
  {
    expiresAt: 1,
  },
  { expireAfterSeconds: 0 },
);

refreshTokenSchema.index({ userId: 1, tokenHash: 1 });

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
