import bcrypt from "bcrypt";
import { SplittedtDateTime } from "../type";
import { AEncryptService } from "./encrypt.abstract";

export class EncryptService extends AEncryptService {
	async encryptPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}

	async comparePasswords(
		password: string,
		userPassword: string
	): Promise<boolean> {
		return bcrypt.compare(password, userPassword);
	}
}
