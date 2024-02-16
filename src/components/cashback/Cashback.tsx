import cx from "classnames";
import { Typography } from "@alfalab/core-components/typography";

import { useActions } from "@/lib/actions/ActionsContext";

import styles from "./Cashback.module.css";

type CashbackProps = {
	value: string;
	className?: string;
};

export const Cashback: React.FC<CashbackProps> = ({ value, className }) => {
	return (
		<div className={cx(styles["container"], className)}>
			<span className={styles["icon"]} />

			<Typography.Text
				view="secondary-medium"
				weight="medium"
				color="static-primary-dark"
			>
				Кэшбэк {value}
			</Typography.Text>
		</div>
	);
};

export const CashbackAB: React.FC<CashbackProps> = ({ value, className }) => {
	const { city } = useActions();

	return (
		<div className={cx(styles["container"], className)}>
			{/* <svg
				xmlns="http://www.w3.org/2000/svg"
				width={24}
				height={24}
				fill="none"
			>
				<title>Alfa</title>
				<path
					fill="#EF3124"
					fillRule="evenodd"
					d="M22.5 12.002c0 5.799-4.701 10.5-10.5 10.5s-10.5-4.701-10.5-10.5 4.701-10.5 10.5-10.5 10.5 4.701 10.5 10.5ZM11.988 7.313l-1.3 3.75h2.576l-1.228-3.75h-.048Zm.096-2.061c1.044 0 1.348.604 1.613 1.37l2.733 7.911h-2.023l-.613-1.88h-3.66l-.662 1.88H7.57l2.868-7.912c.278-.767.602-1.37 1.646-1.37ZM7.57 16.642h8.86v2.11H7.57v-2.11Z"
					clipRule="evenodd"
				/>
			</svg> */}

			<span className={styles["icon"]} />

			{city.cityId === 2 ? (
				<Typography.Text
					view="secondary-medium"
					weight="medium"
					color="static-primary-dark"
				>
					Кэшбэк {value}
				</Typography.Text>
			) : (
				<Typography.Text
					view="primary-small"
					weight="medium"
					color="static-primary-dark"
				>
					{value}
				</Typography.Text>
			)}
		</div>
	);
};
