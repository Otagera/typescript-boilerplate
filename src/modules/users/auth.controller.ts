import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { get, post, bodyValidator, controller } from "../../decorators/index";
import { User } from "./users.interface";
import { RequestWithBody } from "src/interfaces";

const UserModel = mongoose.model<User>("User");

@controller("/auth")
export class AuthController {
	@post("/login")
	@bodyValidator("username", "password")
	async userLogin(req: RequestWithBody, res: Response) {
		const { username, password } = req.body;
		const dataF = {
			message: "Auth failed!",
		};
		try {
			const users: User[] = await UserModel.find({
				username: username.toLowerCase(),
			});
			if (users.length < 1) {
				return res.statusJson(401, { data: dataF });
			}
			bcrypt.compare(password, users[0].password, (err, result) => {
				if (err) {
					return res.statusJson(401, { data: dataF });
				}
				if (result) {
					const token = jwt.sign(
						{
							username: users[0].username,
							userId: users[0]._id,
						},
						process.env.JWT_KEY,
						{
							expiresIn: "48h",
						}
					);
					const data = {
						message: "Auth Successful",
						token: token,
						username: users[0].username,
					};
					return res.statusJson(200, { data: data });
				}
				return res.statusJson(402, { data: dataF });
			});
		} catch (error) {
			const data = {
				error,
				success: false,
			};
			return res.statusJson(500, { data: data });
		}
	}

	@post("/signup")
	@bodyValidator(
		"username",
		"password",
		"email",
		"address",
		"firstname",
		"lastname"
	)
	async userSignup(req: RequestWithBody, res: Response) {
		const { username, password, email, address, firstname, lastname } =
			req.body;
		try {
			const users: User[] = await UserModel.find({
				username: username.toLowerCase(),
			});

			if (users.length >= 1) {
				const data = {
					message: "Sorry this username has already been taken",
				};
				return res.statusJson(409, { data: data });
			} else {
				bcrypt.hash(password, 10, async (err, hash) => {
					if (err) {
						return res.statusJson(500, {
							data: {
								err: err,
							},
						});
					} else {
						const user = new UserModel({
							username: username.toLowerCase(),
							password: hash,
							email,
							address,
							firstname,
							lastname,
						});
						const newUser = await user.save();
						const data = {
							message: "User created",
							success: true,
							user: newUser,
						};
						return res.statusJson(200, { data: data });
					}
				});
			}
		} catch (error) {
			console.log("===============");
			console.log(error);
			console.log("===============");
			const data = {
				error,
				success: false,
			};
			return res.statusJson(500, { data: data });
		}
	}
}
