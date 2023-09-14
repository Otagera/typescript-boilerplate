import { Request, Response } from "express";

import { post, bodyValidator, controller } from "../../decorators/index";
import { IUser } from "./users.interface";
import { RequestWithBody } from "src/interfaces";
import { UsersService } from "./users.service";
import { EncryptService } from "@lib/utils";

console.log("Test");

@controller("/auth")
class AuthController {
	private static _usersService: UsersService = new UsersService();
	private static _encryptService: EncryptService = new EncryptService();

	@post("/login")
	@bodyValidator("username", "password")
	async userLogin(req: RequestWithBody, res: Response) {
		const { username, password } = req.body;
		const data = {
			message: "Auth failed!",
		};
		try {
			const users: IUser[] = await AuthController._usersService.find({
				username: username.toLowerCase(),
			});
			if (users.length < 1) {
				return res.statusJson(401, { data });
			}
			const result = await AuthController._encryptService.comparePasswords(
				password,
				users[0].password
			);
			if (result) {
				const token = AuthController._encryptService.createAuthToken(
					users[0].username
				);
				const data = {
					message: "Auth Successful",
					token: token,
					username: users[0].username,
				};
				return res.statusJson(200, { data: data });
			}
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
		console.log("this", this);
		const { username, password, email, address, firstname, lastname } =
			req.body;
		try {
			const users: IUser[] = await AuthController._usersService.find({
				username: username.toLowerCase(),
			});

			if (users.length >= 1) {
				const data = {
					message: "Sorry this username has already been taken",
				};
				return res.statusJson(409, { data: data });
			} else {
				const hash = await AuthController._encryptService.encryptPassword(
					password
				);
				const user = await AuthController._usersService.create(
					username.toLowerCase(),
					hash,
					email,
					address,
					firstname,
					lastname
				);
				const data = {
					message: "User created",
					success: true,
					user,
				};
				return res.statusJson(200, { data: data });
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
// const temp = new AuthController();
