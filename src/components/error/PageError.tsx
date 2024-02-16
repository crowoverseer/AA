import { useAsyncError } from "react-router-dom";
import { Button } from "@alfalab/core-components/button";

import { APIError } from "@/lib/error";

import { InlineNonCriticalError } from "./NonCriticalError";

type PageErrorProps = {
	action: {
		label: string;
		callback(): void;
	};
};

export const PageError: React.FC<PageErrorProps> = ({ action }) => {
	const error = useAsyncError() as Error;

	if (error instanceof APIError && error.type === "message") {
		return (
			<InlineNonCriticalError
				title={error.message}
				message={error.advice}
				action={
					<Button size="s" view="primary" onClick={action.callback}>
						{action.label}
					</Button>
				}
			/>
		);
	}

	throw error;
};
