import mongoose from "mongoose";
import path from "path";
import { FileManipulation } from "@lib/utils/modules/file-manipulation/FIleManipulation";

let uri = "";

if (process.env.NODE_ENV === "production" && process.env.MONGODB_URL) {
	uri = process.env.MONGODB_URL;
} else if (process.env.MONGODB_URL) {
	uri = process.env.MONGODB_URL;
}

if (uri) {
	mongoose.connect(uri);
}

mongoose.connection.on("connected", () => {
	const log = `Mongoose connected to ${uri}`;
	const eq = Array.from(log)
		.map(() => "=")
		.join("");
	console.log(eq);
	console.log(log);
	console.log(eq);
});

mongoose.connection.on("error", (err) => {
	console.log(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
	console.log("Mongoose disconnected");
});

export const shutdown = (msg: string, callback) => {
	mongoose.connection.addListener("close", () => {
		console.log(`Mongoose disconnected through ${msg}`);
		callback();
	});
};

process.once("SIGUSR2", () => {
	shutdown("nodemon restart", () => {
		process.kill(process.pid, "SIGUSR2");
	});
});

process.on("SIGINT", () => {
	shutdown("app termination", () => {
		process.exit(0);
	});
});

process.on("SIGTERM", () => {
	shutdown("Heroku app shutdown", () => {
		process.exit(0);
	});
});

FileManipulation.loadupModels(path.join(__dirname, "/modules"));
