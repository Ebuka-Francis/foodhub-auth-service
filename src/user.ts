import { Schema, model, Document } from "mongoose";

export type UserRole = "customer" | "cook" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "cook", "admin"],
      default: "customer",
    },
    refreshTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);