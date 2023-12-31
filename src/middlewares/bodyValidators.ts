import { Request, Response, NextFunction, RequestHandler } from "express";

export const bodyValidators = function (keys: string): RequestHandler {
	return function (req: Request, res: Response, next: NextFunction) {
		if (!req.body) {
			res.status(422).send("Invalid request");
			return;
		}

		for (let key of keys) {
			if (!req.body[key]) {
				res.status(422).send(`Missing property ${key}`);
				return;
			}
		}
		next();
	};
};
