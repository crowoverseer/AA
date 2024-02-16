import { useNavigate } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";

import { formatPrice } from "@/lib/utils/formatPrice";
import { ActionEvent } from "@/lib/types";

import styles from "./EventItem.module.css";

type EventItemProps = {
	data: ActionEvent & { date: Date };
};

export const EventItem: React.FC<EventItemProps> = ({ data }) => {
	const navigate = useNavigate();

	const goToResevation = () => {
		navigate(`${location.pathname}/reservation/${data.actionEventId}`);
	};

	return (
		<div className={styles["container"]}>
			<div className={styles["content"]}>
				<div>
					<Typography.Text
						view="primary-small"
						weight="medium"
						className={styles["datetime"]}
					>
						{new Intl.DateTimeFormat("ru-RU", {
							day: "numeric",
							month: "long",
						}).format(data.date)}
						, {data.time}
					</Typography.Text>

					<Typography.Text view="primary-small" color="secondary">
						{new Intl.DateTimeFormat("ru-RU", {
							weekday: "long",
						}).format(data.date)}
					</Typography.Text>
				</div>

				<Button size="xs" view="primary" onClick={goToResevation}>
					{data.minPrice
						? `от ${formatPrice({ amount: data.minPrice, currency: "RUB" })}`
						: "Выбрать"}
				</Button>
			</div>
		</div>
	);
};
