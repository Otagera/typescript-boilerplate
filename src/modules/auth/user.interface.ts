import mongoose, { Document } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
  email?: string;
  address?: string;
  firstname?: string;
  lastname?: string;
}
export interface UserWithId extends User {
  _id: number;
}
