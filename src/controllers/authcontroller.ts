import { verifyRefreshToken, signRefreshToken, signAccessToken } from '../type/jwt';
import { Request, Response } from "express";
import { User } from "../models/user";
import { hashPassword, comparePassword } from "../utils/password";
import { AuthRequest } from "../middleware/auth";

// POST /register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "name, email and password are required" });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: (err as Error).message });
  }
};

// POST /login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user.id });

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: (err as Error).message });
  }
};

// POST /refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "refreshToken is required" });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const newAccessToken = signAccessToken({ userId: user.id, role: user.role });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// POST /logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: "refreshToken is required" });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

  // Inside logout function:
if (user) {
  user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
  await user.save();
}

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    res.status(400).json({ message: "Logout failed" });
  }
};

// GET /me
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select("-passwordHash -refreshTokens");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// PUT /me (Update Profile & Vendor Info)
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      name,
      phoneNumber,
      profileImage,
      dateOfBirth,
      gender,
      address,
      businessName,
      logo,
      description,
      subscription,
    } = req.body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (logo !== undefined) updateData.logo = logo;
    if (description !== undefined) updateData.description = description;
    if (subscription !== undefined) updateData.subscription = subscription;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-passwordHash -refreshTokens");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile", error: (err as Error).message });
  }
};