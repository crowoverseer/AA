import { forwardRef } from "react";
import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { IconButton } from "@alfalab/core-components/icon-button";
import { CrossMIcon } from "@alfalab/icons-glyph/CrossMIcon";
import cx from "classnames";

import { formatPrice } from "@/lib/utils/formatPrice";

import styles from "./Schema.module.css";
import { Button } from "@alfalab/core-components/button";

enum SchemaStatus {
	IDLE = "IDLE",
	READY = "READY",
	ERROR = "ERROR",
}

type HCDetail = {
	category: {
		sbt_color: string;
		sbt_id: string;
		sbt_price: string;
		tariffs?: Array<{
			sbt_id: string;
			sbt_name: string;
			sbt_price: string;
		}>;
	};
	cx: string;
	cy: string;
	id: string;
	r: string;
	sbt_cat: string;
	sbt_id: string;
	sbt_owner: string | null;
	sbt_row: string;
	sbt_seat: string;
	sbt_sect: string;
	sbt_state: string;
	sbt_tariff: string | null;
};

type SchemaProps = {
	status: SchemaStatus;
	selectedSeat: HCDetail | null;
	onAdd(seat: {
		id: string;
		tariffId: string | null;
	}): void;
	onCancel(): void;
};

export const Schema = forwardRef<HTMLDivElement, SchemaProps>(
	({ status, selectedSeat, onAdd, onCancel }, forwardedRef) => {
		const hasTariffs = Boolean(selectedSeat?.category.tariffs);

		return (
			<div className={styles["container"]}>
				<div className={cx(styles["hall-control"])}>
					<div ref={forwardedRef} style={{ height: "100%" }} />
				</div>

				{selectedSeat && (
					<Space fullWidth className={styles["tariffs-container"]}>
						{hasTariffs ? (
							<div className={styles["tariffs-header"]}>
								<Space size={4}>
									<Typography.Text view="primary-large" weight="bold">
										Выбор тарифа
									</Typography.Text>
									<Typography.Text
										weight={hasTariffs ? "regular" : "bold"}
									>{`${selectedSeat.sbt_sect} сектор, ${selectedSeat.sbt_row} ряд, ${selectedSeat.sbt_seat} место`}</Typography.Text>
									{!hasTariffs && (
										<Typography.Text>
											{formatPrice({
												amount: Number(selectedSeat.category.sbt_price),
												currency: "RUB",
											})}
										</Typography.Text>
									)}
								</Space>

								<IconButton
									icon={CrossMIcon}
									size="xs"
									onClick={onCancel}
									className={styles["close-button"]}
								/>
							</div>
						) : (
							<Space size={4}>
								<Typography.Text
									weight={hasTariffs ? "regular" : "bold"}
								>{`${selectedSeat.sbt_sect} сектор, ${selectedSeat.sbt_row} ряд, ${selectedSeat.sbt_seat} место`}</Typography.Text>
								<Typography.Text>
									{formatPrice({
										amount: Number(selectedSeat.category.sbt_price),
										currency: "RUB",
									})}
								</Typography.Text>
							</Space>
						)}

						{selectedSeat.category.tariffs && (
							<Space fullWidth>
								{selectedSeat.category.tariffs.map((tariff) => (
									<div key={tariff.sbt_id} className={styles["tariff-item"]}>
										<Space size={0}>
											<Typography.Text>{tariff.sbt_name}</Typography.Text>
											<Typography.Text color="secondary">
												{formatPrice({
													amount: Number(tariff.sbt_price),
													currency: "RUB",
												})}
											</Typography.Text>
										</Space>

										<Button
											view="primary"
											size="s"
											onClick={() => {
												onAdd({
													id: selectedSeat.sbt_id,
													tariffId: tariff.sbt_id,
												});
											}}
										>
											Добавить
										</Button>
									</div>
								))}
							</Space>
						)}

						{!hasTariffs && (
							<Space direction="horizontal" fullWidth>
								<Button block onClick={onCancel}>
									Отмена
								</Button>
								<Button
									block
									view="primary"
									onClick={() => {
										onAdd({
											id: selectedSeat.sbt_id,
											tariffId: null,
										});
									}}
								>
									Добавить
								</Button>
							</Space>
						)}
					</Space>
				)}

				{status === SchemaStatus.IDLE && (
					<div className={styles["message"]}>
						<Typography.Text color="secondary">
							Загружаем схему...
						</Typography.Text>
					</div>
				)}

				{status === SchemaStatus.ERROR && (
					<div className={styles["message"]}>
						<Typography.Text color="secondary">
							Ошибка загрузки схемы
						</Typography.Text>
					</div>
				)}
			</div>
		);
	},
);
