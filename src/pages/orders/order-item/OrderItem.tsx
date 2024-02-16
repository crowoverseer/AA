import { useNavigate } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { InformationCircleSIcon } from "@alfalab/icons-glyph/InformationCircleSIcon";

import { formatPrice } from "@/lib/utils/formatPrice";
import { formatDateTime } from "@/lib/utils/formatDate";
import { plural } from "@/lib/utils/plural";
import { Order, OrderStatus } from "@/lib/types";

import styles from "./OrderItem.module.css";

const statusColors = {
	[OrderStatus.NEW]: "secondary",
	[OrderStatus.PROCESSING]: "negative",
	[OrderStatus.PAID]: "positive",
	[OrderStatus.CANCELLING]: "secondary",
	[OrderStatus.CANCELLED]: "secondary",
	[OrderStatus.REFUNDED]: "secondary",
} as const;

const statusMessages = {
	[OrderStatus.NEW]: "Ожидание оплаты",
	[OrderStatus.PROCESSING]: "В процессе оплаты",
	[OrderStatus.PAID]: "Заказ оплачен",
	[OrderStatus.CANCELLING]: "Операция отклонена",
	[OrderStatus.CANCELLED]: "Операция отклонена",
	[OrderStatus.REFUNDED]: "В процессе возврата",
} as const;

function getDate(dateString: string) {
	const [date, time] = dateString.split(" ");
	const [day, mounth, year] = date.split(".");
	const [hours, minutes, seconds] = time.split(":");

	return new Date(`${year}-${mounth}-${day}T${hours}:${minutes}:${seconds}`);
}

type OrderItemProps = {
	data: Order;
	onDelete?(): void;
};

export const OrderItem: React.FC<OrderItemProps> = ({ data, onDelete }) => {
	const navigate = useNavigate();

	return (
		<div className={styles["container"]}>
			<div className={styles["info"]}>
				<div>
					<Typography.TitleMobile
						tag="div"
						view="medium"
						weight="bold"
						className={styles["title"]}
					>
						{formatPrice({ amount: data.sum, currency: "RUB" })}
					</Typography.TitleMobile>

					<div>
						<Typography.Text
							view="secondary-medium"
							color={statusColors[data.statusExtInt]}
							className={styles["status"]}
						>
							{data.statusExtStr === "PAID" && <InformationCircleSIcon />}
							{statusMessages[data.statusExtInt]}
						</Typography.Text>
					</div>
				</div>

				<div>
					<Typography.Text view="primary-medium" className={styles["date"]}>
						{formatDateTime(getDate(data.date), {
							day: "numeric",
							month: "long",
							hour: "2-digit",
							minute: "2-digit",
						})}
					</Typography.Text>

					<Typography.Text
						view="secondary-medium"
						color="secondary"
						className={styles["orderNumber"]}
					>
						Заказ №{data.orderId}
					</Typography.Text>
				</div>
			</div>

			{data.ticketList.length > 0 && data.statusExtStr !== "REFUNDED" && (
				<div className={styles["footer"]}>
					<div className={styles["footer-item"]}>
						<div className={styles["footer-cell"]}>
							<Typography.Text view="primary-small" weight="bold">
								{data.ticketList[0].actionName}
							</Typography.Text>

							<Typography.Text view="secondary-medium" color="secondary">
								{`${data.quantity} ${plural(
									["билет", "билета", "билетов"],
									data.quantity,
								)}`}
							</Typography.Text>
						</div>

						<div className={styles["footer-cell"]}>
							<Button
								size="xxs"
								view="primary"
								onClick={() => navigate(`/orders/${data.orderId}`)}
							>
								Билеты
							</Button>
						</div>
					</div>
				</div>
			)}

			{data.statusExtInt === OrderStatus.NEW && (
				<div className={styles["additional-section"]}>
					<Button
						block
						size="s"
						view="accent"
						onClick={() => {
							window.location.href = data.formUrl;
						}}
					>
						Оплатить
					</Button>
				</div>
			)}

			{onDelete && (
				<div className={styles["additional-section"]}>
					<Button block size="s" view="tertiary" onClick={onDelete}>
						Удалить
					</Button>
				</div>
			)}
		</div>
	);
};
