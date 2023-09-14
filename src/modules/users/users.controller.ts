import { Request, Response } from "express";
import mongoose, { ObjectId } from "mongoose";

import { get, controller } from "../../decorators/index";
import { IUser } from "./users.interface";
import { UsersService } from "./users.service";
import { HttpStatus, StandardAPIResponseFn } from "@lib/utils";

const UserModel = mongoose.model<IUser>("User");

@controller("/users")
export class UserController {
	private static _usersService: UsersService = new UsersService();

	@get("/exist/:username")
	async checkUserExistence(req: Request, res: Response) {
		const { username } = req.params;
		try {
			const users: IUser[] = await UserController._usersService.find({
				username: username,
			});
			if (users.length < 1) {
				return res.statusJson(
					HttpStatus.NOT_FOUND,
					StandardAPIResponseFn(
						`User with username: ${username} doesn't exist!`,
						false
					)
				);
			}
			return res.statusJson(
				HttpStatus.OK,
				StandardAPIResponseFn(
					`User with username: ${username} does exist!`,
					true
				)
			);
		} catch (error) {
			return res.statusJson(
				HttpStatus.INTERNAL_SERVER_ERROR,
				StandardAPIResponseFn("Something went wrong!", false, error)
			);
		}
	}
	@get("/users")
	async getAllUsers(req: Request, res: Response) {
		try {
			const users: IUser[] = await UserController._usersService.find({});
			if (users.length === 0) {
				return res.statusJson(
					HttpStatus.NOT_FOUND,
					StandardAPIResponseFn(`No user in the DB`, false)
				);
			}
			return res.statusJson(
				HttpStatus.OK,
				StandardAPIResponseFn(`Users in DB`, true, { users })
			);
		} catch (error) {
			return res.statusJson(
				HttpStatus.INTERNAL_SERVER_ERROR,
				StandardAPIResponseFn("Something went wrong!", false, error)
			);
		}
	}
	@get("/users/:id")
	async getUser(req: Request, res: Response) {
		const { id } = req.params;
		let data: { status: boolean; message?: String; user?: IUser } = {
			status: false,
		};
		try {
			if (!mongoose.Types.ObjectId.isValid(id)) {
				return res.statusJson(
					HttpStatus.NOT_ACCEPTABLE,
					StandardAPIResponseFn(`Invalid ObjectId: ${id}`, false)
				);
			}
			const objectId = new mongoose.Schema.Types.ObjectId(id);
			const user = await UserController._usersService.findOne(objectId);
			if (!user) {
				return res.statusJson(
					HttpStatus.NOT_FOUND,
					StandardAPIResponseFn(`User not found`, false)
				);
			}
			return res.statusJson(
				HttpStatus.OK,
				StandardAPIResponseFn(`User fetched successfully`, true, { user })
			);
		} catch (error) {
			return res.statusJson(
				HttpStatus.INTERNAL_SERVER_ERROR,
				StandardAPIResponseFn("Something went wrong!", false, error)
			);
		}
	}
}
