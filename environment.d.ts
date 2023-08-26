import { Express } from "express-serve-static-core";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			MONGO_URI: string;
			NODE_ENV: "development" | "production";
			PORT?: string;
			PWD: string;
		}
	}
}
declare module "express-serve-static-core" {
	interface Response {
		statusJson: (statusCode: number, data: {}) => void;
	}
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
