import { Spinner } from "@alfalab/core-components/spinner";

import styles from "./PageLoader.module.css";

export const PageLoader: React.FC = () => {
	return (
		<div className={styles["container"]}>
			<Spinner visible size="m" />
		</div>
	);
};
