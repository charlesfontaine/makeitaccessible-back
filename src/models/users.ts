import mongoose, { Types } from "mongoose";

export interface IUsers {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  token: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUsers>({
  firstName: String,
  lastName: String,
  username: String,
  email: String,
  password: String,
  token: String,
  googleId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUsers>("users", userSchema);

export default User;
