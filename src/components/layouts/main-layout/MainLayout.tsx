import { Outlet } from "react-router-dom";

import styles from "./MainLayout.module.css";

export const MainLayout: React.FC = () => {
	return (
		<div className={styles["container"]}>
			<main className={styles["main-view"]}>
				<Outlet />
			</main>
		</div>
	);
};
