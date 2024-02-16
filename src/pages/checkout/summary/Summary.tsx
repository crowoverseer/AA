import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { Divider } from "@alfalab/core-components/divider";

import { formatPrice } from "@/lib/utils/formatPrice";
import { plural } from "@/lib/utils/plural";
import { GetCartResult, CartSeat } from "@/lib/types";

import styles from "./Summary.module.css";

type SummaryProps = {
	data: GetCartResult & {
		event: {
			name: string;
			poster: string;
			address: string;
			date: Date;
			seatList: CartSeat[];
		};
	};
};

export const Summary: React.FC<SummaryProps> = ({ data }) => {
	return (
		<Space
			size={24}
			fullWidth
			divider={<Divider />}
			className={styles["container"]}
		>
			<div className={styles["header"]}>
				<Typography.TitleMobile tag="h2" view="xsmall" weight="bold">
					Выбранные билеты
				</Typography.TitleMobile>

				<Typography.Text view="primary-small" weight="medium">
					{`${data.event.seatList.length} ${plural(
						["билет", "билета", "билетов"],
						data.event.seatList.length,
					)}`}
				</Typography.Text>
			</div>

			<Space size={24} fullWidth divider={<Divider />}>
				{data.actionEventList[0].seatList.map((item) => (
					<div key={item.categoryPriceId} className={styles["row"]}>
						<div className={styles["row-left"]}>
							<Typography.Text view="primary-medium">
								{item.row
									? `${item.row} ряд, ${item.number} место`
									: item.categoryPriceName}
							</Typography.Text>
							{item.tariffPlanName && (
								<Typography.Text view="primary-small" color="secondary">
									{item.tariffPlanName}
								</Typography.Text>
							)}
						</div>

						<div>
							<Typography.Text view="primary-medium" weight="medium">
								{formatPrice({
									amount: item.price,
									currency: data.currency,
								})}
							</Typography.Text>
						</div>
					</div>
				))}
			</Space>
		</Space>
	);
};
