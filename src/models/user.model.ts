import mongoose, { Schema } from "mongoose";
import { User } from "../interfaces";

const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

mongoose.model<User>("User", userSchema);
