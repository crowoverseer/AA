import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import {
	useParams,
	useNavigate,
	Await,
	useRouteLoaderData,
} from "react-router-dom";
import { Space } from "@alfalab/core-components/space";
import {
	SegmentedControl,
	Segment,
} from "@alfalab/core-components/segmented-control";
import cx from "classnames";

import { Spinner } from "@alfalab/core-components/spinner";
import { NonCriticalError } from "@/components/error/NonCriticalError";
import { AuthStatus, CartItemType, useCart } from "@/lib/cart/CartContext";
import { usePageSettings, usePageTitle } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/formatDate";
import { apiService } from "@/lib/api";
import { APIError } from "@/lib/error";
import { ActionExt, ActionEvent, GetActionResult } from "@/lib/types";

import { Category } from "./category/Category";
import { Schema } from "./schema/Schema";
import { ReservationSummary } from "./summary/ReservationSummary";
import { AuthModal } from "./auth-modal/AuthModal";

import styles from "./ReservationView.module.css";

function formatDate(args: { date: Date | number; time: string }) {
	const date = new Date(args.date);
	const [hour, min] = args.time.split(":");
	date.setHours(Number(hour), Number(min));

	return formatDateTime(date, {
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

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

enum TabId {
	Category = "Category",
	Schema = "Schema",
}

type ReservationTabsProps = {
	data: ActionExt & { event: ActionEvent; schema?: string };
};

const ReservationTabs: React.FC<ReservationTabsProps> = ({ data }) => {
	const navigate = useNavigate();
	const cart = useCart();
	const hallcontrolRef = useRef<any | null>(null);
	const schemaRef = useRef<HTMLDivElement | null>(null);
	const [schemaStatus, setSchemaStatus] = useState<SchemaStatus>(
		SchemaStatus.IDLE,
	);
	const [selectId, setSelected] = useState<TabId>(TabId.Category);
	const [showAuth, setShowAuth] = useState(false);
	const [selectedSeat, setSelectedSeat] = useState<HCDetail | null>(null);
	const [error, setError] = useState<APIError | null>(null);

	const hasCategories = data.event.categoryLimitList.length > 0;
	const hasSchema = Boolean(data.event.placementUrl);

	const removeSeat = (seat_id: number) => {
		if (schemaRef.current && hallcontrolRef.current) {
			const circle = schemaRef.current.querySelector(
				`circle[sbt\\:id="${seat_id}"]`,
			);

			hallcontrolRef.current.fn.click(
				circle, // HTML элемент e.detail.circle
				false, // id тарифа, или false если тариф отсутствует
			);
		}
	};

	const toCheckout = () => {
		const cartItems = Object.values(cart.items);
		const categoryItems = cartItems.filter(
			({ type }) => type === CartItemType.Category,
		);
		const seatItems = cartItems.filter(
			({ type }) => type === CartItemType.Seat,
		);

		return apiService
			.unreserveAll()
			.then(() =>
				apiService.reserve({
					eid: data.event.actionEventId,
					categories: categoryItems.map(({ id, tariffId, qty }) => ({
						cid: id,
						tid: tariffId,
						qty,
					})),
					seats: seatItems.map(({ id, tariffId }) => ({
						sid: id,
						tid: tariffId,
					})),
				}),
			)
			.then(() => navigate("/checkout"))
			.catch((err: APIError) => {
				if (err.code === "user_unauthorized") {
					setShowAuth(true);
				} else {
					setError(err);
				}
			});
	};

	// Change initial tab
	useEffect(() => {
		if (!hasCategories) {
			setSelected(TabId.Schema);
		}
	}, [hasCategories]);

	useEffect(() => {
		if (data.schema) {
			try {
				// @ts-ignore
				const HC = HallControl({
					crisper: schemaRef.current,
					svg: data.schema,
					// info: false,
				});

				hallcontrolRef.current = HC;

				if (typeof HC.el.svg !== "undefined") {
					// Обработчики всех событий должны быть здесь

					// удалить стандартный обработчик "место продано"
					HC.el.svg.removeEventListener("oops.HC", HC.fn.oopsListener);

					// удалить стандартный обработчик "наведение/тап"
					HC.el.svg.removeEventListener("hover.HC", HC.fn.hoverListener);

					// добавить обработчик "наведение/тап"
					// @ts-ignore
					HC.el.svg.addEventListener("hover.HC", (e) => {
						// тэг circle на SVG схеме
						const circle = e.detail.circle;

						// информация о месте
						const seat: HCDetail = HC.fn.seat(circle);
						if (!seat) return false;

						// без тарифов
						if (
							typeof seat.category.tariffs === "undefined" ||
							seat.sbt_state === "2"
						) {
							// сразу click по месту
							HC.fn.click(circle);

							// с тарифами
						} else {
							setSelectedSeat(seat);
							// вывести шторку
							// addScreen(circle, seat);
						}
					});

					// @ts-ignore
					const handleReserve = (event) => {
						// Получить информацию о выбранном месте
						const detail: HCDetail = HC.fn.seat(event.detail.circle);

						let price = detail.category.sbt_price;
						let tariff: {
							tariffPlanId: string;
							tariffPlanName: string;
						} | null = null;

						if (detail.category.tariffs) {
							const _tariff = detail.category.tariffs.find(
								({ sbt_id }) => Number(sbt_id) === Number(detail.sbt_tariff),
							);

							if (_tariff) {
								tariff = {
									tariffPlanId: _tariff.sbt_id,
									tariffPlanName: _tariff.sbt_name,
								};

								price = _tariff.sbt_price;
							} else {
								tariff = null;
							}
						}

						cart.addItems([
							{
								id: Number(detail.sbt_id),
								key: detail.sbt_id,
								eventId: data.event.actionEventId,
								name: `${detail.sbt_row} ряд, ${detail.sbt_seat} место`,
								subHeading: `Сектор ${detail.sbt_sect}`,
								price: Number(price),
								qty: 1,
								type: CartItemType.Seat,
								action: {
									name: data.actionName,
									poster: data.poster,
									address: data.address,
									date: new Date(data.event.timestamp * 1000),
								},
								tariffId: tariff?.tariffPlanId
									? Number(tariff.tariffPlanId)
									: undefined,
								tariffName: tariff?.tariffPlanName,
							},
						]);

						// Вызвать функцию остановки индикатора бронирования
						HC.fn.loaded(
							event.detail.circle, // circle, - HTML элемент e.detail.circle
							true, // clockwise, - true (по умолчанию) для бронирования
						);
					};

					// @ts-ignore
					const handleUnreserve = (event) => {
						const detail: HCDetail = HC.fn.seat(event.detail.circle);

						// Вызвать функцию остановки индикатора бронирования
						HC.fn.loaded(event.detail.circle, false, () => {
							cart.removeItems([detail.sbt_id]);
						});
					};

					// @ts-ignore
					HC.el.svg.addEventListener("reserve.HC", handleReserve);

					// @ts-ignore
					HC.el.svg.addEventListener("unreserve.HC", handleUnreserve);

					setSchemaStatus(SchemaStatus.READY);

					return () => {
						HC.el.svg.removeEventListener("reserve.HC", handleReserve);
						HC.el.svg.removeEventListener("unreserve.HC", handleUnreserve);
					};
				}
			} catch (err) {
				setSchemaStatus(SchemaStatus.ERROR);
			}
		}
	}, [data.schema]);

	return (
		<Fragment>
			{hasCategories && hasSchema && (
				<div className={styles["tabs"]}>
					<SegmentedControl
						onChange={(id) => setSelected(id as TabId)}
						selectedId={selectId}
					>
						<Segment id={TabId.Category} title="Входной билет" />
						<Segment id={TabId.Schema} title="Выбор места" />
					</SegmentedControl>
				</div>
			)}

			<div className={styles["tab-content"]}>
				<div
					className={styles["list"]}
					style={{
						flexDirection: "column",
						visibility: selectId === TabId.Category ? "visible" : "hidden",
					}}
				>
					{selectId === TabId.Category && (
						<Space direction="vertical" size="s" fullWidth>
							{data.event.categoryLimitList.map((limitGroup, idx) => (
								<div key={idx.toString()}>
									{limitGroup.categoryList.map((category) => (
										<Category
											key={category.categoryPriceId}
											limitId={idx.toString()}
											eventId={data.event.actionEventId}
											tariffPlanList={data.event.tariffPlanList}
											remainder={limitGroup.remainder}
											action={{
												name: data.actionName,
												poster: data.poster,
												address: data.address,
												date: new Date(data.event.timestamp * 1000),
											}}
											data={category}
										/>
									))}
								</div>
							))}
						</Space>
					)}
				</div>

				{data.schema && (
					<div
						className={cx(selectId !== TabId.Schema && styles["tab-inactive"])}
						style={{
							position: "absolute",
							flex: 1,
							flexDirection: "column",
							display: "flex",
							inset: 0,
						}}
					>
						<Schema
							ref={schemaRef}
							status={schemaStatus}
							selectedSeat={selectedSeat}
							onAdd={(seat) => {
								if (schemaRef.current && hallcontrolRef.current) {
									const circle = schemaRef.current.querySelector(
										`circle[sbt\\:id="${seat.id}"]`,
									);

									hallcontrolRef.current.fn.click(
										circle, // HTML элемент e.detail.circle
										seat.tariffId, // id тарифа, или false если тариф отсутствует
									);

									hallcontrolRef.current.fn.away();
									setSelectedSeat(null);
								}
							}}
							onCancel={() => {
								hallcontrolRef.current.fn.away();
								setSelectedSeat(null);
							}}
						/>
					</div>
				)}
			</div>

			<ReservationSummary
				onCheckout={toCheckout}
				onRemove={({ type, id }) => {
					if (type === CartItemType.Seat) {
						removeSeat(id);
					}
				}}
			/>

			<AuthModal
				open={showAuth}
				onSubmit={() => {
					setShowAuth(false);
					toCheckout();
				}}
				onClose={() => {
					setShowAuth(false);
				}}
			/>

			<NonCriticalError
				open={Boolean(error)}
				message={error?.advice}
				onClose={() => setError(null)}
				action={{
					label: "Вернуться",
					callback: () => navigate("./../..", { replace: true }),
				}}
			/>
		</Fragment>
	);
};

type ReservationProps = {
	data?: ActionExt;
	pending?: boolean;
};

const Reservation: React.FC<ReservationProps> = ({ data, pending = false }) => {
	const params = useParams();
	const [actionData, setActionData] = useState<
		(ActionExt & { event: ActionEvent; schema?: string }) | null
	>(null);

	usePageTitle(
		actionData?.from
			? formatDate({ date: actionData.from, time: actionData.event.time })
			: "",
	);

	useEffect(() => {
		if (data) {
			const event = Object.values(data.events).find(
				({ actionEventId }) => actionEventId === Number(params.eventId),
			);

			if (!event) {
				throw new Error("Сеанс не найден");
			}

			if (event.placementUrl) {
				apiService
					.getSchema({ eid: Number(params.eventId) })
					.then((schema) => setActionData({ ...data, event, schema }));
			} else {
				setActionData({ ...data, event });
			}
		} else {
			return undefined;
		}
	}, [data, params.eventId]);

	return (
		<Fragment>
			<div className={styles["container"]}>
				{actionData && !pending ? (
					<ReservationTabs data={actionData} />
				) : (
					<div className="centered">
						<Spinner size="m" visible />
					</div>
				)}
			</div>
		</Fragment>
	);
};

type ActionData = {
	action: Promise<GetActionResult>;
};

export const Component: React.FC = () => {
	const params = useParams();
	const data = useRouteLoaderData("action") as ActionData;
	const cart = useCart();
	const [isPending, setPending] = useState(false);

	usePageSettings({
		pageId: 3,
		pageTitle: "Выбор билета",
	});

	// Remove old cart items and reservations
	useEffect(() => {
		const oldCartItems = Object.values(cart.items).filter(
			({ eventId }) => eventId !== Number(params.eventId),
		);

		if (oldCartItems.length > 0) {
			setPending(true);

			if (cart.authStatus === AuthStatus.AUTH) {
				apiService
					.unreserveAll()
					.then(() => cart.removeItems())
					.finally(() => setPending(false));
			} else {
				cart.removeItems();
				setPending(false);
			}
		}
	}, [params.eventId, cart]);

	return (
		<Suspense fallback={<Reservation />}>
			<Await resolve={data.action}>
				{(action: ActionExt) => (
					<Reservation data={action} pending={isPending} />
				)}
			</Await>
		</Suspense>
	);
};
