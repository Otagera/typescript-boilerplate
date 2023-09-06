import { AuthToken } from "../type";

export abstract class AEncryptService {
	abstract encryptPassword(password: string): Promise<string>;
	abstract comparePasswords(
		password: string,
		userPassword: string
	): Promise<boolean>;
	abstract createAuthToken(username: string, id?: string): AuthToken;
}
