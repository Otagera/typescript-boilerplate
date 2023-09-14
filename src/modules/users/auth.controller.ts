import { Response } from "express";

import { post, bodyValidator, controller } from "../../decorators/index";
import { IUser } from "./users.interface";
import { RequestWithBody } from "src/interfaces";
import { UsersService } from "./users.service";
import { EncryptService, StandardAPIResponseFn, HttpStatus } from "@lib/utils";
import {} from "@lib/utils";

console.log("Test");

@controller("/auth")
class AuthController {
	private static _usersService: UsersService = new UsersService();
	private static _encryptService: EncryptService = new EncryptService();

	@post("/login")
	@bodyValidator("username", "password")
	async userLogin(req: RequestWithBody, res: Response) {
		const { _usersService, _encryptService } = AuthController;
		const { username, password } = req.body;
		try {
			const users: IUser[] = await _usersService.find({
				username: username.toLowerCase(),
			});
			if (users.length < 1) {
				return res.statusJson(
					HttpStatus.UNAUTHORIZED,
					StandardAPIResponseFn("Auth failed!", false, {})
				);
			}
			const result = await _encryptService.comparePasswords(
				password,
				users[0].password
			);
			if (result) {
				const token = _encryptService.createAuthToken(users[0].username);
				return res.statusJson(
					HttpStatus.OK,
					StandardAPIResponseFn("Auth successful", true, {
						token: token,
						username: users[0].username,
					})
				);
			}
		} catch (error) {
			return res.statusJson(
				HttpStatus.INTERNAL_SERVER_ERROR,
				StandardAPIResponseFn("Something went wrong!", false, error)
			);
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
		const { _usersService, _encryptService } = AuthController;
		const { username, password, email, address, firstname, lastname } =
			req.body;
		try {
			const users: IUser[] = await _usersService.find({
				username: username.toLowerCase(),
			});

			if (users.length >= 1) {
				return res.statusJson(
					HttpStatus.CONFLICT,
					StandardAPIResponseFn(
						"Sorry this username has already been taken",
						false
					)
				);
			} else {
				const hash = await _encryptService.encryptPassword(password);
				const user = await _usersService.create(
					username.toLowerCase(),
					hash,
					email,
					address,
					firstname,
					lastname
				);
				return res.statusJson(
					HttpStatus.OK,
					StandardAPIResponseFn("User created successful", true, {
						user,
					})
				);
			}
		} catch (error) {
			return res.statusJson(
				HttpStatus.INTERNAL_SERVER_ERROR,
				StandardAPIResponseFn("Something went wrong!", false, error)
			);
		}
	}
}
