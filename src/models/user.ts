import { Schema, model, Document } from "mongoose";

export type UserRole = "customer" | "cook" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  refreshTokens: string[];
  // Profile fields
  phoneNumber?: string;
  profileImage?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  // Vendor/Cook specific fields
  businessName?: string;
  logo?: string;
  description?: string;
  subscription?: string;
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
    // Profile fields
    phoneNumber: { type: String, trim: true },
    profileImage: { type: String, trim: true },
    dateOfBirth: { type: String, trim: true },
    gender: { type: String, trim: true },
    address: { type: String, trim: true },
    // Vendor/Cook specific fields
    businessName: { type: String, trim: true },
    logo: { type: String, trim: true },
    description: { type: String, trim: true },
    subscription: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);