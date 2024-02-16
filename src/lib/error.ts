export type ErrorType = "warning" | "message";
export class APIError extends Error {
	code: string;
	message: string;
	advice: string;
	system: string;
	type: "warning" | "message";

	constructor(config: {
		code: string;
		message: string;
		advice: string;
		system: string;
		type?: ErrorType;
	}) {
		super();

		this.code = config.code;
		this.advice = config.advice;
		this.system = config.system;
		this.message = config.message || "Произошла ошибка";
		this.type = config.type || "warning";
	}
}
