import { Document, ObjectId } from "mongoose";

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
	_id: ObjectId;
}

export interface IUsersService {
	create(
		username: string,
		password: string,
		email: string,
		address: string,
		firstname: string,
		lastname: string
	): Promise<IUser>;

	findOne(id: ObjectId): Promise<IUser>;

	find(filter: {
		username?: string;
		password?: string;
		email?: string;
		address?: string;
		firstname?: string;
		lastname?: string;
	}): Promise<IUser[]>;
	update(id: ObjectId, attrs: Partial<IUser>): Promise<IUser>;
	remove(id: ObjectId): Promise<IUser>;
}
