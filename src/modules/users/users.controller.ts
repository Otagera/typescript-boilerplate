import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { get, post, bodyValidator, controller } from "../../decorators/index";
import { User } from "./users.interface";
import { UsersService } from "./users.service";

const UserModel = mongoose.model<User>("User");

@controller("/users")
export class AuthController {
	constructor(private userService: UsersService) {}

	@get("/exist/:username")
	async checkUserExistence(req: Request, res: Response) {
		const { username } = req.params;
		let data = { status: false };
		try {
			const user: User = await UserModel.findOne({
				username: username,
			});
			if (!user) {
				return res.statusJson(404, { data: data });
			}
			data.status = true;
			return res.statusJson(200, { data: data });
		} catch (error) {
			console.log(error);
			data["error"] = error;
			return res.statusJson(500, { data: data });
		}
	}
	@get("/users")
	async getAllUsers(req: Request, res: Response) {
		let data: { status: boolean; users: User[] } = {
			status: false,
			users: [],
		};
		try {
			const users = await UserModel.find({});
			if (users.length === 0) {
				return res.statusJson(404, { data: data });
			}
			data.status = true;
			data.users = users;
			return res.statusJson(200, { data: data });
		} catch (error) {
			console.log(error);
			data["error"] = error;
			return res.statusJson(500, { data: data });
		}
	}
	@get("/users/:id")
	async getUser(req: Request, res: Response) {
		const { id } = req.params;
		let data: { status: boolean; message?: String; user?: User } = {
			status: false,
		};
		try {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				data.message = "Invalid object id";
				return res.statusJson(400, { data: data });
			}
			const user = await UserModel.findOne({ id });
			if (!user) {
				data.message = "User not found";
				return res.statusJson(404, { data: data });
			}
			data.status = true;
			data.user = user;
			return res.statusJson(200, { data: data });
		} catch (error) {
			console.log(error);
			data["error"] = error;
			return res.statusJson(500, { data: data });
		}
	}
}
