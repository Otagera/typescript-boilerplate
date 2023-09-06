/* eslint-disable @typescript-eslint/naming-convention */
interface Raw {
	body: any;
	protocol: string;
	_body?: boolean;
}

export interface RequestType {
	id: number | string;
	method: string;
	url: string;
	query: any;
	params: any;
	raw: Raw;
	headers: any;
	remoteAddress: string;
	remotePort: number;
}

export type SplittedtDateTime = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
};

export type RecursivelyListDirCallback = (name: string) => void;
