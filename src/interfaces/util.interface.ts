import { Request } from 'express';

export interface RequestWithBody extends Request {
	body: { [key: string]: string | undefined};
}
export interface RequestWithParams extends Request {
	params: { [key: string]: string | undefined};
}
export interface RequestWithBodyParams extends Request {
	body: { [key: string]: string | undefined};
	params: { [key: string]: string | undefined};
}
export interface RequestWithDecoded extends Request {
	decoded: string | object
}