export const StandardAPIResponseFn: IStandardAPIResponseFn = (
	message: string,
	status: boolean,
	data: Record<string, unknown> = {}
) => {
	return {
		status: status ? "Success" : "Failed",
		message: message && status ? "Request is successfull" : "Request failed.",
		data,
	};
};

export interface IStandardAPIResponseFn {
	(
		message: string,
		status: boolean,
		data?: Record<string, unknown>
	): IStandardAPIResponse;
}

export interface IStandardAPIResponse {
	status: string;
	message: string;
	data: Record<string, unknown>;
}
