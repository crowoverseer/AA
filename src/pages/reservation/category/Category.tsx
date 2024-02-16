import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Typography } from "@alfalab/core-components/typography";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";
import { IconButton } from "@alfalab/core-components/icon-button";
import { Space } from "@alfalab/core-components/space";
import { Button } from "@alfalab/core-components/button";
import { MinusMIcon } from "@alfalab/icons-glyph/MinusMIcon";
import { PlusMIcon } from "@alfalab/icons-glyph/PlusMIcon";

import { useToggle } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ActionEvent } from "@/lib/types";

import {
	useCart,
	CartItem,
	ItemPayload,
	CartItemType,
} from "@/lib/cart/CartContext";

import styles from "./Category.module.css";

type BaseCategoryProps = {
	title: string;
	price: number;
	quantity: number;
	availableCount: number;
	onDecrease(): void;
	onIncrease(): void;
};

const BaseCategory: React.FC<BaseCategoryProps> = ({
	title,
	price,
	quantity,
	availableCount,
	onDecrease,
	onIncrease,
}) => {
	return (
		<div>
			<div className={styles["content"]}>
				<Space size={0}>
					<Typography.TitleMobile
						tag="h2"
						view="xsmall"
						className={styles["title"]}
					>
						{title}
					</Typography.TitleMobile>

					<Typography.Text view="secondary-large" color="secondary">
						{formatPrice({ amount: price, currency: "RUB" })}
					</Typography.Text>

					<Typography.Text view="secondary-large" color="secondary">
						{availableCount} билетов
					</Typography.Text>
				</Space>

				<div className={styles["counter"]}>
					<IconButton
						icon={MinusMIcon}
						disabled={quantity === 0}
						onClick={onDecrease}
						className={styles["counter-button"]}
					/>
					<Typography.Text>{quantity}</Typography.Text>
					<IconButton
						icon={PlusMIcon}
						disabled={availableCount === 0}
						onClick={onIncrease}
						className={styles["counter-button"]}
					/>
				</div>
			</div>
		</div>
	);
};

type CategoryProps = {
	limitId: string;
	eventId: number;
	remainder?: number;
	action: {
		name: string;
		poster: string;
		address: string;
		date: Date;
	};
	data: {
		availability: number;
		categoryPriceId: number;
		categoryPriceName: string;
		price: number;
		tariffIdMap: Record<number, number>;
	};
};

const SingleTariffCategory: React.FC<CategoryProps> = ({
	data,
	remainder,
	limitId,
	eventId,
	action,
}) => {
	const cart = useCart();

	const cartItem = useMemo(() => {
		return Object.values(cart.items).find(
			({ id }) => id === data.categoryPriceId,
		);
	}, [data, cart]);

	const key = `${data.categoryPriceId}`;
	const quantity = cartItem?.qty || 0;

	const availableTicketsCount = useMemo(() => {
		const categoryAvailability = data.availability - quantity;

		if (remainder) {
			const totalAvailability = remainder - cart.totalCount;

			return totalAvailability > categoryAvailability
				? categoryAvailability
				: totalAvailability;
		} else {
			return categoryAvailability;
		}
	}, [remainder, cart, data, quantity]);

	const increase = () => {
		cart.increaseItem({
			key,
			type: CartItemType.Category,
			name: data.categoryPriceName,
			id: data.categoryPriceId,
			price: data.price,
			limitId,
			eventId,
			action,
		});
	};

	const decrease = () => {
		cart.decreaseItem(key);
	};

	return (
		<BaseCategory
			title={data.categoryPriceName}
			price={data.price}
			quantity={quantity}
			availableCount={availableTicketsCount}
			onIncrease={increase}
			onDecrease={decrease}
		/>
	);
};

type TariffItemProps = {
	tariffId: number;
	name: string;
	price: number;
	categoryPriceId: number;
	categoryPriceName: string;
	limitId: string;
	eventId: number;
	availability: number;
	action: {
		name: string;
		poster: string;
		address: string;
		date: Date;
	};
	items: CartItem[];
	onIncrease(item: Omit<CartItem, "qty" | "time">): void;
	onDecrease(key: string): void;
};

const TariffItem: React.FC<TariffItemProps> = ({
	tariffId,
	name,
	price,
	categoryPriceId,
	categoryPriceName,
	limitId,
	eventId,
	availability,
	items,
	action,
	onIncrease,
	onDecrease,
}) => {
	const key = `${categoryPriceId}:${tariffId}`;

	const cartItem = useMemo(() => {
		return Object.values(items).find((item) => item.key === key);
	}, [items, key]);

	const totalCount = useMemo(() => {
		return Object.values(items).reduce((acc, item) => acc + item.qty, 0);
	}, [items]);

	const quantity = cartItem?.qty || 0;

	return (
		<div className={styles["tariff"]}>
			<div>
				<Typography.TitleMobile tag="h2" view="xsmall">
					{formatPrice({ amount: price, currency: "RUB" })}
				</Typography.TitleMobile>
				<Typography.Text view="secondary-medium" color="secondary">
					{name}
				</Typography.Text>
			</div>

			<div className={styles["counter"]}>
				<IconButton
					icon={MinusMIcon}
					disabled={quantity === 0}
					onClick={() => onDecrease(key)}
					className={styles["counter-button"]}
				/>
				<Typography.Text>{quantity}</Typography.Text>
				<IconButton
					icon={PlusMIcon}
					disabled={availability <= totalCount}
					onClick={() => {
						onIncrease({
							key,
							type: CartItemType.Category,
							name: categoryPriceName,
							tariffName: name,
							tariffId,
							eventId,
							id: categoryPriceId,
							price,
							limitId,
							action,
						});
					}}
					className={styles["counter-button"]}
				/>
			</div>
		</div>
	);
};

const MultipleTariffCategory: React.FC<
	CategoryProps & { tariffPlanList: ActionEvent["tariffPlanList"] }
> = ({ data, action, limitId, eventId, tariffPlanList, remainder }) => {
	const cart = useCart();
	const [isOpenModal, toggleOpenModal] = useToggle(false);
	const [items, setItems] = useState<Array<ItemPayload>>([]);
	const itemsRef = useRef(items);

	const quantity = useMemo(() => {
		return Object.values(cart.items)
			.filter((item) => item.id === data.categoryPriceId)
			.reduce((acc, item) => acc + item.qty, 0);
	}, [data, cart]);

	const availableTicketsCount = useMemo(() => {
		const categoryAvailability = data.availability - quantity;

		if (remainder) {
			const totalAvailability = remainder - cart.totalCount;

			return totalAvailability > categoryAvailability
				? categoryAvailability
				: totalAvailability;
		} else {
			return categoryAvailability;
		}
	}, [remainder, cart, data, quantity]);

	const tariffs = useMemo(() => {
		return Object.entries(data.tariffIdMap).reduce(
			(acc, [tariffId, price]) => {
				const plan = tariffPlanList.find(
					(tariff) => tariff.tariffPlanId === Number(tariffId),
				);

				if (!plan) {
					return acc;
				}

				return [...acc, { action, tariffId, price, ...plan }];
			},
			[] as Array<{
				tariffId: string;
				tariffPlanId: number;
				tariffPlanName: string;
				price: number;
			}>,
		);
	}, [tariffPlanList, data.tariffIdMap, action]);

	const increase = (item: CartItem) => {
		setItems((state) => {
			const existingIdx = state.findIndex(({ key }) => key === item.key);

			if (existingIdx !== -1) {
				const newState = [...state];
				const existing = newState[existingIdx];

				newState[existingIdx] = { ...existing, action, qty: existing.qty + 1 };

				return newState;
			} else {
				return [...state, { ...item, action, qty: 1 }];
			}
		});
	};

	const decrease = (key: string) => {
		setItems((state) => {
			const existingIdx = state.findIndex((item) => item.key === key);

			if (existingIdx !== -1) {
				const newState = [...state];
				const existing = newState[existingIdx];

				newState[existingIdx] = { ...existing, qty: existing.qty - 1 };

				return newState;
			}

			return state;
		});
	};

	const apply = () => {
		cart.addItems(items);
		toggleOpenModal(false);
		itemsRef.current = items;
	};

	const reset = () => {
		const newState = items.map((item) => ({ ...item, qty: 0 }));

		setItems(newState);

		cart.addItems(newState);
		toggleOpenModal(false);
	};

	useEffect(() => {
		const items = Object.values(cart.items);
		setItems(items);
		itemsRef.current = items;
	}, [cart.items]);

	return (
		<Fragment>
			<BaseCategory
				title={data.categoryPriceName}
				price={data.price}
				quantity={quantity}
				availableCount={availableTicketsCount}
				onIncrease={() => toggleOpenModal(true)}
				onDecrease={() => toggleOpenModal(true)}
			/>

			<BottomSheet
				title={
					<Typography.TitleMobile view="xsmall" weight="bold" tag="h5">
						Выберите тариф
					</Typography.TitleMobile>
				}
				titleSize="compact"
				swipeable
				hasCloser
				open={isOpenModal}
				onClose={() => {
					toggleOpenModal(false);
					setItems(itemsRef.current);
				}}
				actionButton={
					<Space direction="vertical" fullWidth size={8}>
						<Button
							size="s"
							view="primary"
							onClick={apply}
							style={{ width: "100%" }}
						>
							Выбрать
						</Button>
						<Button
							size="s"
							view="secondary"
							onClick={reset}
							style={{ width: "100%" }}
						>
							Сбросить
						</Button>
					</Space>
				}
				usePortal
			>
				{/* <div className={styles["alert"]}>
					<Badge
						view="icon"
						iconColor="negative"
						content={<AlertCircleMIcon />}
					/>
					<Typography.Text
						view="primary-small"
						weight="bold"
						className={styles["alert-message"]}
					>
						Внимание! Входные билеты бронируются при переходе в корзину
					</Typography.Text>
				</div> */}

				<Space fullWidth size="l" className={styles["tariffs"]}>
					{tariffs.map(({ tariffPlanId, tariffPlanName, price }) => (
						<TariffItem
							key={tariffPlanId}
							tariffId={tariffPlanId}
							name={tariffPlanName}
							price={price}
							categoryPriceId={data.categoryPriceId}
							categoryPriceName={data.categoryPriceName}
							limitId={limitId}
							eventId={eventId}
							availability={data.availability}
							action={action}
							items={items}
							onIncrease={increase}
							onDecrease={decrease}
						/>
					))}
				</Space>
			</BottomSheet>
		</Fragment>
	);
};

export const Category: React.FC<
	CategoryProps & { tariffPlanList: ActionEvent["tariffPlanList"] }
> = ({ limitId, eventId, action, data, tariffPlanList, remainder }) => {
	const hasTarrifs = Object.keys(data.tariffIdMap).length > 0;

	if (hasTarrifs) {
		return (
			<MultipleTariffCategory
				action={action}
				limitId={limitId}
				eventId={eventId}
				data={data}
				tariffPlanList={tariffPlanList}
				remainder={remainder}
			/>
		);
	}

	return (
		<SingleTariffCategory
			action={action}
			limitId={limitId}
			eventId={eventId}
			remainder={remainder}
			data={data}
		/>
	);
};
