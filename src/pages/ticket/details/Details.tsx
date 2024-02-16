import { Typography } from "@alfalab/core-components/typography";

import { formatDateTime } from "@/lib/utils/formatDate";

import styles from "./Details.module.css";

type DetailsProps = {
	data: {
		date: Date;
		orderNo: number;
	};
};

export const Details: React.FC<DetailsProps> = ({ data }) => {
	return (
		<div className={styles["container"]}>
			<div className={styles["row"]}>
				<Typography.Text>
					{formatDateTime(data.date, {
						day: "numeric",
						month: "long",
					})}
				</Typography.Text>
				<Typography.Text>№ заказа</Typography.Text>
			</div>

			<div className={styles["row"]}>
				<Typography.TitleMobile tag="h5" view="medium" weight="medium">
					{formatDateTime(data.date, {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</Typography.TitleMobile>
				<Typography.Text view="secondary-large" color="secondary">
					{data.orderNo}
				</Typography.Text>
			</div>
		</div>
	);
};
