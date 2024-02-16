import { useEffect } from "react";
import {
	LoaderFunction,
	useLoaderData,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import { Spinner } from "@alfalab/core-components/spinner";

import { useTheme, Theme } from "@/lib/theme";
import { apiService } from "@/lib/api";
import { AlfaAuthResult } from "@/lib/types";

import styles from "./AuthView.module.css";

type AuthData = AlfaAuthResult;

export const AuthView: React.FC = () => {
	const data = useLoaderData() as AuthData;
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const themeCtx = useTheme();

	useEffect(() => {
		const theme = searchParams.get("theme");

		if (theme) {
			themeCtx.toggleTheme(theme as Theme);
		}

		if (String(data.cityId) === "0") {
			navigate("/city", { replace: true });
		} else {
			navigate(`/city/${data.cityId}`, { replace: true });
		}
	}, [data]);

	return (
		<div className={styles["container"]}>
			<Spinner size="m" visible />
		</div>
	);
};

export const authLoader: LoaderFunction = ({ params }) => {
	return apiService.alfaAuth({ guid: String(params.guid) });
};
