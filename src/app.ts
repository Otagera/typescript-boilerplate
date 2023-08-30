// import "../environment.d.ts";
import { Express } from "express-serve-static-core";
import express, {
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
} from "express";
import * as http from "http";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import "pino-mongodb";
import { LoggerService } from "@lib/logger";
import { EnvConfigService } from "@lib/utils";
import { AppRouter } from "./AppRouter";

dotenv.config();
const envConfigService = new EnvConfigService();
const logger = new LoggerService(
	envConfigService.mongodb.pinoConnectionString,
	"system"
);
logger.connect(envConfigService.LOG_LEVEL);
const port = envConfigService.mainAPI.port;
import "./db";
import "./modules/index.module";

export const app: Express = express();
const server: http.Server = http.createServer(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger.pino);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use((req: Request, res: Response, next: NextFunction) => {
	res.statusJson = (statusCode: number, data: {}): void => {
		let obj = {
			...data,
			statusCode: statusCode,
		};
		res.status(statusCode).json(obj);
		return;
	};
	next();
});
app.use(AppRouter.getInstance());

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
	next(createError(404));
});

// error  handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};
	logger.error(err);

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

app.set("port", port);

server.listen(port);
server.on("listening", () => {
	console.log("=============");
	console.log("App is listening from port: " + port);
	console.log("=============");
});
