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
import { EnvConfigService, HttpStatus, IStandardAPIResponse } from "@lib/utils";
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

export const app: Express = express();
const server: http.Server = http.createServer(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger.pino);
app.use(cookieParser());
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

app.use((req: Request, res: Response, next: NextFunction) => {
	res.statusJson = (
		statusCode: HttpStatus,
		data: IStandardAPIResponse
	): void => {
		res.status(statusCode).json(data);
		return;
	};
	next();
});

app.set("base", "/api/v1");
app.use("/api/v1", AppRouter.getInstance());

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
	console.log("================================");
	console.log("App is listening from port: " + port);
});

process.on("SIGINT", () => {
	server.close();
});
import "./modules/index.module";
/* 
function print(path, layer) {
	if (layer.route) {
		layer.route.stack.forEach(
			print.bind(null, path.concat(split(layer.route.path)))
		);
	} else if (layer.name === "router" && layer.handle.stack) {
		layer.handle.stack.forEach(
			print.bind(null, path.concat(split(layer.regexp)))
		);
	} else if (layer.method) {
		console.log(
			"%s /%s",
			layer.method.toUpperCase(),
			path.concat(split(layer.regexp)).filter(Boolean).join("/")
		);
	}
}

function split(thing) {
	if (typeof thing === "string") {
		return thing.split("/");
	} else if (thing.fast_slash) {
		return "";
	} else {
		var match = thing
			.toString()
			.replace("\\/?", "")
			.replace("(?=\\/|$)", "$")
			.match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);
		return match
			? match[1].replace(/\\(.)/g, "$1").split("/")
			: "<complex:" + thing.toString() + ">";
	}
}

app._router.stack.forEach(print.bind(null, []));
 */
