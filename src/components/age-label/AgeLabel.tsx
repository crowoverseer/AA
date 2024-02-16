import { Typography } from "@alfalab/core-components/typography";
import cx from "classnames";

import styles from "./AgeLabel.module.css";

type AgeLabel = {
	age: string;
	className?: string;
};

export const AgeLabel: React.FC<AgeLabel> = ({ age, className }) => {
	return (
		<span className={cx(styles["container"], className)}>
			<Typography.Text view="secondary-large" color="static-primary-dark">
				{age}
			</Typography.Text>
		</span>
	);
};
