import { Request, Response } from "express";
import { get, controller } from "../../decorators/index";

@controller("/")
class RootController {
	@get("/")
	getRootPage(req: Request, res: Response) {
		res.send({ index: "index" });
	}
}
