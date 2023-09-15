/* eslint-disable @typescript-eslint/naming-convention */
import { IncomingMessage, ServerResponse } from "node:http";
import { gray, green, isColorSupported, red, yellow } from "colorette";
import {
	InternalServerErrorException,
	RequestToCurlConverter,
} from "@lib/utils";
import { ApiException } from "@lib/utils";
import { DateTime } from "luxon";
import { LevelWithSilent, Logger, multistream, pino } from "pino";
import { HttpLogger, Options, pinoHttp } from "pino-http";
import pinoPretty from "pino-pretty";
import { v4 as uuidv4 } from "uuid";
import { ILoggerService } from "./logger.abstract";
import { ErrorType, MessageType } from "./type";

export class LoggerService implements ILoggerService {
	pino: HttpLogger;
	private _app: string;

	constructor(
		private _pinoConnectionString: string,
		private _timeZone: string
	) {}
	async connect<T = LevelWithSilent>(logLevel: T): Promise<void> {
		const pinoLogger = pino(
			{
				useLevelLabels: true,
				level: [logLevel, "info"].find(Boolean).toString(),
			},
			multistream([
				{
					level: "trace",
					stream: pinoPretty(this.getPinoConfig()),
				},
				{
					level: "info",
					stream: pino.transport({
						target: "pino-mongodb",
						options: {
							uri: this._pinoConnectionString,
							collection: "pino-logs",
						},
					}),
				},
			])
		);

		this.pino = pinoHttp(this.getPinoHttpConfig(pinoLogger));
	}

	setApplication(app: string): void {
		this._app = app;
	}

	log(message: string): void {
		// console.log('🌶️', message);
		// console.log('🎁', green(message));
		this.trace({ message: green(message), context: "log" });
	}

	trace({ message, context, obj = {} }: MessageType): void {
		// console.log('🍅--> ', obj, message, '**', context);
		Object.assign(obj, { context });
		this.pino.logger.trace([obj, gray(message)].find(Boolean), gray(message));
	}

	info({ message, context, obj = {} }: MessageType): void {
		Object.assign(obj, { context });
		this.pino.logger.info([obj, green(message)].find(Boolean), green(message));
	}

	warn({ message, context, obj = {} }: MessageType): void {
		Object.assign(obj, { context });
		this.pino.logger.warn(
			[obj, yellow(message)].find(Boolean),
			yellow(message)
		);
	}

	error(error: ErrorType, message?: string, context?: string): void {
		const errorResponse = this.getErrorResponse(error);

		const response =
			error?.name === ApiException.name
				? { statusCode: error["statusCode"], message: error?.message }
				: errorResponse?.value();

		const type = {
			Error: ApiException.name,
		}[error?.name];
		this.pino.logger.error(
			{
				...response,
				context: [context, this._app].find(Boolean),
				type: [type, error?.name].find(Boolean),
				traceId: this.gettraceId(error),
				formatedTimestamp: `${this.getDateFormat()}`,
				application: this._app,
				stack: error.stack,
			},
			red(message)
		);
	}

	fatal(error: ErrorType, message?: string, context?: string): void {
		this.pino.logger.fatal(
			{
				// ...(error.getResponse() as object),
				context: [context, this._app].find(Boolean),
				type: error.name,
				traceId: this.gettraceId(error),
				formatedTimestamp: `${this.getDateFormat()}`,
				application: this._app,
				stack: error.stack,
			},
			red(message)
		);
	}

	getPinoConfig() {
		console.log("[getPinoConfig]");
		return {
			colorize: isColorSupported,
			levelFirst: true,
			ignore: "pid,hostname,path,formattedTimeStamp,request,response",
			quietReqLogger: true,
			messageFormat: (log: unknown, messageKey: string) => {
				const message = log[String(messageKey)];
				if (this._app) {
					return `[${this._app}] ${message}`;
				}
				console.log(message);
				return message;
			},
			customPrettifiers: {
				time: () => {
					return `[${this.getDateFormat()}]`;
				},
			},
		};
	}

	getPinoHttpConfig(pinoLogger: Logger): Options {
		return {
			logger: pinoLogger,
			quietReqLogger: true,
			customSuccessMessage: (req: IncomingMessage, res: ServerResponse) => {
				return `request ${
					res.statusCode >= 400 ? red("error") : green("success")
				} with status code: ${res.statusCode}`;
			},
			customErrorMessage: (
				req: IncomingMessage,
				res: ServerResponse,
				error: Error
			) => {
				return `request ${red(error.name)} with status code: ${
					res.statusCode
				} `;
			},
			genReqId: (req: IncomingMessage) => {
				return req.headers.traceid || req.headers.traceId;
			},
			customAttributeKeys: {
				req: "request",
				res: "response",
				err: "error",
				responseTime: "timeTaken",
				reqId: "traceId",
			},
			serializers: {
				err: () => false,
				req: (request) => {
					return {
						method: request.method,
						curl: RequestToCurlConverter.getCurl(request),
					};
				},
				res: pino.stdSerializers.res,
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			customProps: (req: any): any => {
				const context = req.context;

				const traceId = [req?.headers?.traceid, req.id].find(Boolean);

				const path = `${req.protocol}://${req.headers.host}${req.url}`;

				this.pino.logger.setBindings({
					traceId,
					application: this._app,
					context: context,
					path,
					formattedTimeStamp: `${this.getDateFormat()}`,
					timestamp: this.getDateFormat(),
				});

				return {
					traceId,
					application: this._app,
					context: context,
					path,
					formattedTimeStamp: `${this.getDateFormat()}`,
					timestamp: this.getDateFormat(),
				};
			},
			customLogLevel: (
				req: IncomingMessage,
				res: ServerResponse,
				error: Error
			) => {
				if ([res.statusCode >= 400, error].some(Boolean)) {
					return "error";
				}

				if ([res.statusCode >= 300, res.statusCode <= 400].every(Boolean)) {
					return "silent";
				}

				return "info";
			},
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	getErrorResponse(error: ErrorType): any {
		const isFunction = typeof error?.getResponse === "function";
		return [
			{
				conditional: typeof error === "string",
				value: () => new InternalServerErrorException(error).getResponse(),
			},
			{
				conditional: isFunction && typeof error.getResponse() === "string",
				value: () =>
					new ApiException(
						error.getResponse(),
						[error.getStatus(), error["status"]].find(Boolean),
						error["context"]
					).getResponse(),
			},
			{
				conditional: isFunction && typeof error.getResponse() === "object",
				value: () => error?.getResponse(),
			},
			{
				conditional: [
					error?.name === Error.name,
					error?.name == TypeError.name,
				].some(Boolean),
				value: () =>
					new InternalServerErrorException(error.message).getResponse(),
			},
		].find((c) => c.conditional);
	}

	getDateFormat(date = new Date(), format = "dd-MM-yyyy HH:mm:ss"): string {
		return DateTime.fromJSDate(date).setZone(this._timeZone).toFormat(format);
	}

	gettraceId(error): string {
		if (typeof error === "string") return uuidv4();
		return [error.traceId, this.pino.logger.bindings()?.traceId].find(Boolean);
	}
}
