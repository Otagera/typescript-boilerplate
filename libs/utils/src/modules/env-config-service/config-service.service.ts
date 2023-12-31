/* eslint-disable @typescript-eslint/naming-convention */
import { LevelWithSilent } from "pino";
import { IConfigService } from "./config-service.abstract";
import { MainAPI, WorkersAPI } from "./types";
import * as lodash from "lodash";

type ExcludeUndefinedIf<
	ExcludeUndefined extends boolean,
	T
> = ExcludeUndefined extends true ? Exclude<T, undefined> : T | undefined;
type KeyOf<T> = keyof T extends never ? string : keyof T;
export const isUndefined = (obj: any): obj is undefined =>
	typeof obj === "undefined";
export interface ConfigGetOptions {
	/**
	 * If present, "get" method will try to automatically
	 * infer a type of property based on the type argument
	 * specified at the "ConfigService" class-level (example: ConfigService<Configuration>).
	 */
	infer: true;
}

export class ConfigService<
	K = Record<string, unknown>,
	WasValidated extends boolean = false
> {
	set isCacheEnabled(value) {
		this._isCacheEnabled = value;
	}
	get isCacheEnabled() {
		return this._isCacheEnabled;
	}
	private cache;
	private _isCacheEnabled;
	private internalConfig;
	constructor(internalConfig = {}) {
		this.internalConfig = internalConfig;
		this.cache = {};
		this._isCacheEnabled = false;
	}
	/* get<T = any>(propertyPath: KeyOf<K>): ExcludeUndefinedIf<WasValidated, T> {
		const validatedEnvValue = this.getFromValidatedEnv(propertyPath);
		if (!isUndefined(validatedEnvValue)) {
			return validatedEnvValue;
		}
		const defaultValue = undefined;
		const processEnvValue = this.getFromProcessEnv(propertyPath, defaultValue);
		if (!isUndefined(processEnvValue)) {
			return processEnvValue;
		}
		const internalValue = this.getFromInternalConfig(propertyPath);
		if (!isUndefined(internalValue)) {
			return internalValue;
		}
		return defaultValue;
	} */
	get<T = any>(
		propertyPath: KeyOf<K>,
		defaultValueOrOptions?: T | ConfigGetOptions,
		options?: ConfigGetOptions
	): T | undefined {
		const validatedEnvValue = this.getFromValidatedEnv(propertyPath);
		if (!isUndefined(validatedEnvValue)) {
			return validatedEnvValue;
		}
		const defaultValue =
			this.isGetOptionsObject(defaultValueOrOptions as Record<string, any>) &&
			!options
				? undefined
				: defaultValueOrOptions;

		const processEnvValue = this.getFromProcessEnv(propertyPath, defaultValue);
		if (!isUndefined(processEnvValue)) {
			return processEnvValue;
		}

		const internalValue = this.getFromInternalConfig(propertyPath);
		if (!isUndefined(internalValue)) {
			return internalValue;
		}

		return defaultValue as T;
	}
	getFromCache(propertyPath, defaultValue) {
		const cachedValue = lodash.get(this.cache, propertyPath);
		return isUndefined(cachedValue) ? defaultValue : cachedValue;
	}
	getFromValidatedEnv(propertyPath) {
		const validatedEnvValue = lodash.get(
			this.internalConfig["VALIDATED_ENV_PROPNAME"],
			propertyPath
		);
		return validatedEnvValue;
	}
	getFromProcessEnv(propertyPath, defaultValue) {
		if (this.isCacheEnabled && lodash.has(this.cache, propertyPath)) {
			const cachedValue = this.getFromCache(propertyPath, defaultValue);
			return !isUndefined(cachedValue) ? cachedValue : defaultValue;
		}
		const processValue = lodash.get(process.env, propertyPath);
		this.setInCacheIfDefined(propertyPath, processValue);
		return processValue;
	}
	getFromInternalConfig(propertyPath) {
		const internalValue = lodash.get(this.internalConfig, propertyPath);
		return internalValue;
	}
	setInCacheIfDefined(propertyPath, value) {
		if (typeof value === "undefined") {
			return;
		}
		lodash.set(this.cache, propertyPath, value);
	}
	private isGetOptionsObject(
		options: Record<string, any> | undefined
	): options is ConfigGetOptions {
		return options && options?.infer && Object.keys(options).length === 1;
	}
}

export class EnvConfigService extends ConfigService implements IConfigService {
	constructor() {
		super();
	}
	mongodb = {
		connectionString: this.get("MONGO_CONNECTION_STRING"),
		pinoConnectionString: this.get("MONGO_LOGGER_URL"),
	};

	redis = {
		url: this.get("REDIS_URL") || "localhost",
		port: this.get("REDIS_PORT") || 6379,
		ttl: (this.get("REDIS_TTL") || 24) * 60 * 60, // used to set when items in the cache expire
	};

	awsConfig = {
		accessKeyId: this.get("AWS_ACCESS_KEY_ID"),
		secretAccessKey: this.get("AWS_SECRET_KEY"),
		region: this.get("AWS_REGION"),
		url: this.get("AWS_SQS_URL"),
	};

	ENV = this.get<string>("NODE_ENV") || "development";
	JWT_KEY = this.get<string>("JWT_KEY");

	LOG_LEVEL = this.get<LevelWithSilent>("LOG_LEVEL");
	pino = {
		timeZone: this.get("PINO_TIMEZONE"),
	};
	ipToken = this.get("IP_TOKEN");
	ipInfoUrl = this.get("IP_INFO_URL");
	ipInfoTimeOut = this.get("IP_TIMEOUT") || 10000;

	database = {
		host: this.get("DATABASE_HOST"),
		port: this.get<number>("DATABASE_PORT"),
		user: this.get("DATABASE_USERNAME"),
		pass: this.get("DATABASE_PASSWORD"),
	};

	// should contain all main api specific env variables
	mainAPI = {
		port: this.get<number>(MainAPI.PORT) || 3000,
	};

	// should contain all workers api specific env variables
	workersAPI = {
		port: this.get<number>(WorkersAPI.PORT),
	};
}
