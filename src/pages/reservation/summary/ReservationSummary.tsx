import { Fragment, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { IconButton } from "@alfalab/core-components/icon-button";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";
import { PureCell } from "@alfalab/core-components/pure-cell";
import CrossCircleMIcon from "@alfalab/icons-glyph/CrossCircleMIcon";

import { NonCriticalError } from "@/components/error/NonCriticalError";
import { plural } from "@/lib/utils/plural";
import { formatPrice } from "@/lib/utils/formatPrice";
import { CartItem, useCart } from "@/lib/cart/CartContext";

import styles from "./ReservationSummary.module.css";

type ReservationSummaryProps = {
	onRemove?(item: CartItem): void;
	onCheckout(): MaybePromise<void>;
};

export const ReservationSummary: React.FC<ReservationSummaryProps> = ({
	onRemove,
	onCheckout,
}) => {
	const params = useParams();
	const cart = useCart();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMesssage] = useState<string | null>(null);

	const cartItems = useMemo(() => {
		return Object.values(cart.items)
			.filter(({ eventId }) => eventId === Number(params.eventId))
			.sort((a, b) => b.time - a.time)
			.reduce((acc, item) => {
				const flattenItems = [...new Array(item.qty)].map(() => item);

				for (const _item of flattenItems) {
					acc.push(_item);
				}

				return acc;
			}, [] as CartItem[]);
	}, [cart.items, params.eventId]);

	const handleToCheckout = () => {
		setLoading(true);
		Promise.resolve(onCheckout()).finally(() => setLoading(false));
	};

	const isEmpty = cart.totalCount === 0;

	return (
		<Fragment>
			<div className={styles["container"]}>
				{!isEmpty && (
					<div className={styles["scroll-area"]}>
						<ul className={styles["tickets"]}>
							{cartItems.map((ticket) => (
								<li key={ticket.key} className={styles["item"]}>
									<PureCell
										direction="horizontal"
										verticalPadding="default"
										horizontalPadding="both"
										className={styles["ticket"]}
									>
										<PureCell.Content>
											<PureCell.Main className={styles["ticket-info"]}>
												{ticket.subHeading && (
													<PureCell.Text
														titleColor="primary"
														valueColor="secondary"
														view="primary-small"
													>
														{ticket.subHeading}
													</PureCell.Text>
												)}
												<PureCell.Text
													titleColor="primary"
													valueColor="secondary"
													view="primary-small"
												>
													{ticket.name}
												</PureCell.Text>
												{ticket.tariffName && (
													<PureCell.Text
														titleColor="primary"
														valueColor="secondary"
														view="primary-small"
													>
														{ticket.tariffName}
													</PureCell.Text>
												)}
												<PureCell.Text
													titleColor="secondary"
													valueColor="secondary"
													view="primary-small"
												>
													{formatPrice({
														amount: ticket.price,
														currency: "RUB",
													})}
												</PureCell.Text>
											</PureCell.Main>
										</PureCell.Content>

										<PureCell.Addon verticalAlign="center">
											<IconButton
												view="tertiary"
												size="xs"
												icon={CrossCircleMIcon}
												onClick={() => {
													if (onRemove) {
														onRemove(ticket);
													}
													cart.decreaseItem(ticket.key);
												}}
											/>
										</PureCell.Addon>
									</PureCell>
								</li>
							))}
						</ul>
					</div>
				)}

				<div className={styles["footer"]}>
					<Space size={0}>
						<Typography.Text view="primary-large" weight="bold">
							{formatPrice({ amount: cart.totalSum, currency: "RUB" })}
						</Typography.Text>
						<Typography.Text view="secondary-large">
							{cart.totalCount}{" "}
							{plural(["билет", "билета", "билетов"], cart.totalCount)}
						</Typography.Text>
					</Space>

					<Button
						size="m"
						view={isEmpty ? "secondary" : "primary"}
						loading={isLoading}
						onClick={handleToCheckout}
						disabled={isEmpty}
					>
						Далее
					</Button>
				</div>
			</div>

			<NonCriticalError
				open={Boolean(errorMessage)}
				message={errorMessage}
				onClose={() => setErrorMesssage(null)}
				action={{
					label: "Продолжить",
					callback: () => setErrorMesssage(null),
				}}
			/>
		</Fragment>
	);
};
