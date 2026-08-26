import { Schema, model } from "mongoose";

const addressSchema = new Schema({
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  postalCode: {
    type: String,
  },
  street: {
    type: String,
  },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
    },
    role: {
      type: String,
      enum: ["staff", "customer", "admin"],
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      type: addressSchema,
    },
    phoneNo: { type: String },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = model("User", userSchema);
