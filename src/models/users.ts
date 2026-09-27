import mongoose from "mongoose";
import { IUser } from "./types/UserInterface"

const userSchema = new mongoose.Schema<IUser>({
  token: String,
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  googleId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("users", userSchema);

export default User;
