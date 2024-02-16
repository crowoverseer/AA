import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { Checkbox } from "@alfalab/core-components/checkbox";
import Barcode from "react-barcode";

import { formatPrice } from "@/lib/utils/formatPrice";
import { Ticket } from "@/lib/types";

import styles from "./Summary.module.css";

type SummaryProps = {
	data: Ticket & { cashback: number };
	selected: boolean;
	onSelect: (state: boolean) => void;
};

export const Summary: React.FC<SummaryProps> = ({
	data,
	selected,
	onSelect,
}) => {
	return (
		<div>
			<Space size="m" fullWidth>
				<Space size={8} fullWidth>
					<div className={styles["row"]}>
						<div className={styles["ticket-name"]}>
							<Checkbox
								checked={selected}
								onChange={() => onSelect(!selected)}
							/>
							<Typography.Text view="primary-small" weight="bold">
								{data.row
									? `${data.row} ряд, ${data.number} место`
									: data.categoryName}
							</Typography.Text>
						</div>

						<Typography.Text view="primary-small">
							{formatPrice({
								amount: data.price,
								currency: "RUB",
							})}
						</Typography.Text>
					</div>

					<div className={styles["row"]}>
						<Typography.Text view="primary-small">
							Сервисный сбор
						</Typography.Text>

						<Typography.Text view="primary-small">
							{formatPrice({
								amount: data.serviceCharge,
								currency: "RUB",
							})}
						</Typography.Text>
					</div>
				</Space>

				<div className={styles["row"]}>
					<Typography.Text view="primary-large" weight="bold">
						Итого
					</Typography.Text>
					<Typography.Text view="primary-large" weight="bold">
						{formatPrice({ currency: "RUB", amount: data.totalPrice })}
					</Typography.Text>
				</div>

				<div className={styles["footer-row"]}>
					<div className={styles["cashback"]}>
						<span className={styles["cashback-icon"]} />

						<Typography.Text view="primary-small">
							Кэшбэк {data.cashback}%
						</Typography.Text>
					</div>

					<Typography.Text>
						{formatPrice({
							currency: "RUB",
							amount: (data.totalPrice / 100) * data.cashback,
						})}
					</Typography.Text>
				</div>
			</Space>

			<div className={styles["barcode"]}>
				<Barcode value={data.barCodeNumber} height={60} />
			</div>
		</div>
	);
};
