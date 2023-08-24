import { Request, Response } from 'express';
import { get, controller } from './decorators/index';
import {
	
} from '../interfaces/index';



@controller('')
class RootController {
	@get('/')
	getRootPage(req: Request, res: Response){
		res.render('index', { title: 'Eventing Platform' });
	}
}