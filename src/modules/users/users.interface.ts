import mongoose, { Document } from "mongoose";

export interface IUser {
	username: string;
	password: string;
	email?: string;
	address?: string;
	firstname?: string;
	lastname?: string;
	isDeleted?: boolean;
}
export interface IUserDocument extends IUser, Document {}
export interface IUserWithId extends IUser {
	_id: number;
}
