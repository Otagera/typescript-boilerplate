import mongoose, { Document, Model, ObjectId } from "mongoose";
import { IUser, IUserDocument } from "./users.interface";
import { MongoGenericRepository } from "src/mongo-repository";
import { ApiNotFoundException } from "@lib/logger/pino/type";

export class UsersService {
	user: MongoGenericRepository<IUser>;
	private _userRepository: Model<IUserDocument>;
	constructor() {
		this.user = new MongoGenericRepository<IUser>(this._userRepository);
	}
	create(
		username: string,
		password: string,
		email: string,
		address: string,
		firstname: string,
		lastname: string
	) {
		return this.user.create({
			username,
			password,
			email,
			address,
			firstname,
			lastname,
		});
	}

	findOne(id: ObjectId) {
		return this.user.fetch(id);
	}

	find(filter: {
		username?: string;
		password?: string;
		email?: string;
		address?: string;
		firstname?: string;
		lastname?: string;
	}) {
		return this.user.fetchAll({ where: { filter } });
	}
	async update(id: ObjectId, attrs: Partial<IUser>) {
		const user = await this.findOne(id);
		if (!user) {
			throw new ApiNotFoundException("User not found!");
		}
		Object.assign(user, attrs);
		return this.user.update(id, user);
	}
	async remove(id: ObjectId) {
		const user = await this.findOne(id);
		if (!user) {
			throw new ApiNotFoundException("User not found!");
		}
		return this.user.remove(id);
	}
}
