import mongoose, { Schema } from "mongoose";
import { IUser } from "./users.interface";

const userSchema = new Schema<IUser>({
	username: { type: String, required: true, unique: true, trim: true },
	password: { type: String, required: true },
	email: { type: String, required: true },
	address: { type: String, required: true },
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
});

mongoose.model<IUser>("User", userSchema);
