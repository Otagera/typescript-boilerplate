import bcrypt from "bcrypt";
import { AuthToken } from "../type";
import { AEncryptService } from "./encrypt.abstract";
import jwt from "jsonwebtoken";
import { EnvConfigService } from "../env-config-service/config-service.service";

export class EncryptService extends AEncryptService {
	private _envConfigService: EnvConfigService = new EnvConfigService();
	async encryptPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}

	async comparePasswords(
		password: string,
		userPassword: string
	): Promise<boolean> {
		return bcrypt.compare(password, userPassword);
	}

	createAuthToken(username: string, id?: string): AuthToken {
		const accessToken = jwt.sign(
			{ username, id, type: "access" },
			this._envConfigService.JWT_KEY,
			{ expiresIn: "24h" }
		);
		const refreshToken = jwt.sign(
			{ username, id, type: "refresh" },
			this._envConfigService.JWT_KEY,
			{ expiresIn: "720h" }
		);
		return { accessToken, refreshToken };
	}
}
