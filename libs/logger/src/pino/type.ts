import { HttpStatus } from "@lib/utils/modules/exception/httpStatus.enum";
import { HttpException } from "@lib/utils/modules/exception/service";

export type MessageType = {
	/**
	 * message to be logged
	 */
	message: string;
	/**
	 * method or class that the error occured
	 */
	context?: string;
	/**
	 * addtional object to log
	 */
	obj?: object;
};

export type ErrorType = HttpException | BaseException;
export type ParametersType = { [key: string]: unknown };
export type LogLevel =
	| "fatal"
	| "error"
	| "warn"
	| "info"
	| "debug"
	| "trace"
	| "silent";

export class BaseException extends HttpException {
	traceid: string;
	readonly context: string;
	readonly statusCode: number;
	readonly code?: string;
	readonly parameters: ParametersType;

	constructor(
		message: string,
		status: HttpStatus,
		parameters?: ParametersType
	) {
		super(message, status);

		if (parameters) {
			this.parameters = parameters;
		}

		this.statusCode = super.getStatus();
		Error.captureStackTrace(this);
	}
}

export class ApiInternalServerException extends BaseException {
	constructor(errror: string, parameters?: ParametersType) {
		super(errror ?? ApiInternalServerException.name, 500, parameters);
	}
}

export class ApiNotFoundException extends BaseException {
	constructor(errror: string, parameters?: ParametersType) {
		super(errror ?? ApiNotFoundException.name, 404, parameters);
	}
}

export class ApiConflictException extends BaseException {
	constructor(errror: string, parameters?: ParametersType) {
		super(errror ?? ApiConflictException.name, 409, parameters);
	}
}

export class ApiUnauthorizedException extends BaseException {
	constructor(errror: string, parameters?: ParametersType) {
		super(errror ?? ApiUnauthorizedException.name, 401, parameters);
	}
}

export class ApiBadRequestException extends BaseException {
	constructor(errror: string, parameters?: ParametersType) {
		super(errror ?? ApiBadRequestException.name, 400, parameters);
	}
}
