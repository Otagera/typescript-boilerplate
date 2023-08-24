//To  make sure any property i add to response or request would be recognized
declare module "express-serve-static-core" {
  interface Response {
    statusJson: (statusCode: number, data: {}) => void;
  }
}

import { Express } from "express-serve-static-core";
import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import dotenv from "dotenv";
import * as http from "http";
import cors from "cors";
import Airtable from "airtable";

dotenv.config();

export const app: Express = express();
export const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
  endpointUrl: "https://api.airtable.com",
}).base(process.env.AIRTABLE_DB_ID);
export const view = "Grid view";

/**
 * Create HTTP server.
 */
const server: http.Server = http.createServer(app);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use("/api/uploads", express.static("uploads"));
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

import { AppRouter } from "./AppRouter";
app.use(AppRouter.getInstance());

import "./models/db";

import "./controllers/RootController";
import "./controllers/AuthController";
import "./controllers/APIController";

// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});

// error  handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

/**
 * Module dependencies.
 */

const debug = require("debug")("chapidyzz:server");

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || "3000");

app.set("port", port);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
  debug("Listening on " + bind);
  console.log("=============");
  console.log("=============");
  console.log("App is listening from port: " + port);
}
