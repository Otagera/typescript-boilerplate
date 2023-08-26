import { HttpStatus } from "./httpStatus.enum";

export type ErrorModel = {
	error: {
		code: string | number;
		traceId: string;
		message: string;
		timestamp: string;
		path: string;
	};
};

export class HttpException extends Error {
	constructor(
		private response: string | object,
		private status,
		private options?: object
	) {
		super();
		this.response = response;
		this.status = status;
		this.options = options;
		this.initName();
	}

	initName() {
		this.name = this.constructor.name;
	}
	getResponse() {
		return this.response;
	}
	getStatus() {
		return this.status;
	}
}

export class ApiException extends HttpException {
	context: string;
	traceId: string;
	statusCode: number;
	code?: string;
	config?: unknown;

	constructor(
		error: string | object,
		status?: HttpStatus,
		private readonly _ctx?: string
	) {
		super(error, [status, 500].find(Boolean));
		this.statusCode = super.getStatus();

		if (_ctx) {
			this.context = _ctx;
		}
	}
}
export class InternalServerErrorException extends HttpException {
	constructor(objectOrError, descriptionOrOptions = "Internal Server Error") {
		super(
			objectOrError,
			HttpStatus.INTERNAL_SERVER_ERROR,
			typeof descriptionOrOptions === "object"
				? descriptionOrOptions
				: { description: descriptionOrOptions }
		);
	}
}
