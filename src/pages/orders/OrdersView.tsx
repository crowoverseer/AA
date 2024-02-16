import { Suspense, useMemo, useRef, useState } from "react";
import {
	Await,
	defer,
	useLoaderData,
	useRevalidator,
	useNavigation,
	useSubmit,
	ActionFunction,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Input } from "@alfalab/core-components/input";
import { Space } from "@alfalab/core-components/space";
import { Divider } from "@alfalab/core-components/divider";
import { Indicator } from "@alfalab/core-components/indicator";

import { PageLoader } from "@/components/page-loader/PageLoader";
import { usePageSettings } from "@/lib/hooks/usePageSettings";
import { apiService } from "@/lib/api";
import { validateEmail } from "@/lib/utils/validators";
import { APIError } from "@/lib/error";
import { GetOrdersResult, Order, OrderStatus } from "@/lib/types";

import { OrderItem } from "./order-item/OrderItem";

import styles from "./OrdersView.module.css";

type OrdersData = {
	orders: Promise<GetOrdersResult>;
};

type OrdersProps = {
	data: GetOrdersResult;
};

const Orders: React.FC<OrdersProps> = ({ data }) => {
	const revalidator = useRevalidator();

	const hasOrders = data.orderList.length > 0;

	const sortedOrders = useMemo(() => {
		return data.orderList.reduce(
			(acc, order) => {
				acc.list[order.statusExtInt].push(order);

				if (
					order.statusExtInt === OrderStatus.NEW ||
					order.statusExtInt === OrderStatus.PROCESSING
				) {
					acc.pendingCount = acc.pendingCount + 1;
				} else {
					acc.pastCount = acc.pastCount + 1;
				}

				return acc;
			},
			{
				list: {
					[OrderStatus.NEW]: [],
					[OrderStatus.PROCESSING]: [],
					[OrderStatus.PAID]: [],
					[OrderStatus.CANCELLING]: [],
					[OrderStatus.CANCELLED]: [],
					[OrderStatus.REFUNDED]: [],
				},
				pendingCount: 0,
				pastCount: 0,
			} as {
				list: {
					[OrderStatus.NEW]: Order[];
					[OrderStatus.PROCESSING]: Order[];
					[OrderStatus.PAID]: Order[];
					[OrderStatus.CANCELLING]: Order[];
					[OrderStatus.CANCELLED]: Order[];
					[OrderStatus.REFUNDED]: Order[];
				};
				pendingCount: number;
				pastCount: number;
			},
		);
	}, [data]);

	const hasPendingOrders = sortedOrders.pendingCount > 0;
	const hasPastOrders = sortedOrders.pastCount > 0;

	if (!hasOrders) {
		return (
			<div className={styles["centered-container"]}>
				<Typography.Text view="primary-medium">
					У вас нет заказов
				</Typography.Text>
			</div>
		);
	}

	return (
		<div>
			{hasPendingOrders && (
				<div className={styles["container"]}>
					<Space size="s" fullWidth>
						{sortedOrders.list[OrderStatus.NEW].map((order) => (
							<OrderItem key={order.orderId} data={order} />
						))}
						{sortedOrders.list[OrderStatus.PROCESSING].map((order) => (
							<OrderItem key={order.orderId} data={order} />
						))}
					</Space>
				</div>
			)}

			{hasPendingOrders && hasPastOrders && <Divider />}

			{hasPastOrders && (
				<div className={styles["container"]}>
					<div className={styles["history-heading"]}>
						<Typography.TitleMobile tag="h2" view="small" weight="bold">
							История покупок
						</Typography.TitleMobile>

						<Indicator height={24} value={sortedOrders.pastCount} view="grey" />
					</div>

					<Space size="s" fullWidth>
						{sortedOrders.list[OrderStatus.PAID].map((order) => (
							<OrderItem key={order.orderId} data={order} />
						))}
						{sortedOrders.list[OrderStatus.REFUNDED].map((order) => (
							<OrderItem key={order.orderId} data={order} />
						))}
						{sortedOrders.list[OrderStatus.CANCELLING].map((order) => (
							<OrderItem
								key={order.orderId}
								data={order}
								onDelete={() =>
									apiService
										.deleteOrder({ oid: order.orderId })
										.then(() => revalidator.revalidate())
								}
							/>
						))}
						{sortedOrders.list[OrderStatus.CANCELLED].map((order) => (
							<OrderItem
								key={order.orderId}
								data={order}
								onDelete={() =>
									apiService
										.deleteOrder({ oid: order.orderId })
										.then(() => revalidator.revalidate())
								}
							/>
						))}
					</Space>
				</div>
			)}
		</div>
	);
};

const OrdersViewError: React.FC = () => {
	const navigation = useNavigation();
	const submit = useSubmit();
	const [email, setEmail] = useState<string>("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const dirtyRef = useRef(false);

	const handleChangeEmail = (value: string) => {
		dirtyRef.current && setEmailError(validateEmail(value));
		setEmail(value);
	};

	const handleSubmit = () => {
		dirtyRef.current = true;
		const emailErr = validateEmail(email);

		setEmailError(emailErr);

		if (!emailErr) {
			const formData = new FormData();
			formData.append("email", email);

			submit(formData, { method: "post" });
		}
	};

	return (
		<div className={styles["centered-container"]}>
			<div className={styles["error"]}>
				<Space fullWidth>
					<Typography.TitleMobile tag="h2" view="small" weight="bold">
						Авторизация
					</Typography.TitleMobile>

					<Input
						required
						label="Email"
						block={true}
						size="m"
						value={email}
						onChange={(_, { value }) => handleChangeEmail(value)}
						error={emailError}
					/>

					<Button
						type="button"
						block
						view="primary"
						size="s"
						loading={navigation.state === "submitting"}
						onClick={handleSubmit}
					>
						Войти
					</Button>
				</Space>
			</div>
		</div>
	);
};

export const Component: React.FC = () => {
	const data = useLoaderData() as OrdersData;

	usePageSettings({
		pageId: 3,
		pageTitle: "Мои заказы",
	});

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.orders} errorElement={<OrdersViewError />}>
				{(orders) => <Orders data={orders} />}
			</Await>
		</Suspense>
	);
};

export function loader() {
	const ordersPromise = apiService.getOrders().catch((err: APIError) => {
		if (err.code === "-1") {
			return {
				orderList: [],
			};
		}

		throw err;
	});

	return defer({
		orders: ordersPromise,
	});
}

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get("email");

	return apiService
		.auth({ email: String(email) })
		.catch((err: APIError) => ({ error: err }));
};
