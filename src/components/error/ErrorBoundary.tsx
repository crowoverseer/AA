import { useRouteError } from "react-router-dom";
import { Button } from "@alfalab/core-components/button";

import { CriticalError } from "./CriticalError";

export const ErrorBoundary: React.FC = () => {
	const error = useRouteError() as Error;

	console.error(error);

	return (
		<CriticalError
			action={
				<Button
					block
					size="m"
					view="primary"
					onClick={() =>
						window.location.replace(
							"alfabank://webFeature?type=recommendation&url=https%3A%2F%2Fweb.alfabank.ru%2Fpartner-offers%2Fafisha-transfer",
						)
					}
				>
					Вернуться в Альфа
				</Button>
			}
		/>
	);
};
