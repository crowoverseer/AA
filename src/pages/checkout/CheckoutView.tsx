import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import {
	Await,
	defer,
	LoaderFunction,
	useLoaderData,
	useNavigate,
	useRevalidator,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Input } from "@alfalab/core-components/input";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";
import cx from "classnames";

import { PageLoader } from "@/components/page-loader/PageLoader";
import { PageError } from "@/components/error/PageError";
import { NonCriticalError } from "@/components/error/NonCriticalError";
import { useCart } from "@/lib/cart/CartContext";
import { usePageSettings, useToggle } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatPrice } from "@/lib/utils/formatPrice";
import { apiService } from "@/lib/api";
import { APIError } from "@/lib/error";
import { CartSeat, GetCartResult } from "@/lib/types";

import styles from "./CheckoutView.module.css";

function formatTimer(timer: number) {
	return new Intl.DateTimeFormat("ru-RU", {
		minute: "2-digit",
		second: "2-digit",
	}).format(new Date(timer));
}

const NAME_REGEX =
	/^[А-ЯЁ][а-яё]*([-][А-ЯЁ][а-яё]*)?\s[А-ЯЁ][а-яё]*(\s[А-ЯЁ][а-яё]*)?$/i;

const TEL_REGEX = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;

function validateName(value: string) {
	if (value === "") {
		return "Это поле обязательно";
	} else if (!NAME_REGEX.test(value)) {
		return "Некорректное ФИО";
	} else {
		return null;
	}
}

function validatePhone(value: string) {
	if (value === "") {
		return "Это поле обязательно";
	} else if (!TEL_REGEX.test(value)) {
		return "Некорректный номер";
	} else {
		return null;
	}
}

type Cart = GetCartResult & {
	event: {
		name: string;
		poster: string;
		address: string;
		date: Date;
		seatList: CartSeat[];
		fullNameRequired: boolean;
		phoneRequired: boolean;
		fanIdRequired: boolean;
	};
};

type CheckoutData = {
	cart: Promise<Cart | null>;
};

type AdditionalInfoModalProps = {
	open: boolean;
	onClose(): void;
	onSubmit: (data: {
		totalSum: number;
		currency: string;
		name?: string;
		phone?: string;
	}) => void;
	fullNameRequired: boolean;
	phoneRequired: boolean;
	totalSum: number;
	currency: string;
	submitting: boolean;
};

const AdditionalInfoModal: React.FC<AdditionalInfoModalProps> = ({
	fullNameRequired,
	phoneRequired,
	totalSum,
	currency,
	open,
	onClose,
	submitting,
	onSubmit,
}) => {
	const [name, setName] = useState<string>("");
	const [phone, setPhone] = useState<string>("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [phoneError, setPhoneError] = useState<string | null>(null);
	const dirtyRef = useRef(false);

	const handleChangeName = (value: string) => {
		dirtyRef.current && setNameError(validateName(value));
		setName(value);
	};

	const handleChangePhone = (value: string) => {
		dirtyRef.current && setPhoneError(validatePhone(value));
		setPhone(value);
	};

	const handleSubmit = () => {
		dirtyRef.current = true;
		const nameErr = validateName(name);
		const phoneErr = validatePhone(phone);

		setNameError(nameErr);
		setPhoneError(phoneErr);

		if (!nameErr && !phoneErr) {
			onSubmit({
				totalSum,
				currency,
				name,
				phone,
			});
		}
	};

	return (
		<BottomSheet open={open} onClose={onClose} stickyHeader usePortal>
			<Space fullWidth>
				{fullNameRequired && (
					<Input
						required
						block
						name="name"
						label="ФИО"
						placeholder="Иванов Иван Иванович"
						size="m"
						onChange={(_, { value }) => handleChangeName(value)}
						error={nameError}
					/>
				)}
				{phoneRequired && (
					<Input
						required
						type="tel"
						block
						name="phone"
						label="Телефон"
						placeholder="+7"
						size="m"
						onChange={(_, { value }) => handleChangePhone(value)}
						error={phoneError}
					/>
				)}

				<Button
					type="button"
					block
					size="s"
					view="primary"
					loading={submitting}
					onClick={handleSubmit}
				>
					Продолжить
				</Button>
			</Space>
		</BottomSheet>
	);
};

type CheckoutProps = {
	data?: Cart | null;
};

const Checkout: React.FC<CheckoutProps> = ({ data }) => {
	const navigate = useNavigate();
	const localCart = useCart();
	const revalidator = useRevalidator();
	const [showAdditionalInfoModal, toggleAdditionalInfoModal] = useToggle(false);
	const [isCanceledCart, toggleCanceledCart] = useToggle(false);
	const [timer, setSeconds] = useState<number>(data?.time || -1);
	const intervalRef = useRef<NodeJS.Timer>();
	const [error, setError] = useState<APIError | null>(null);
	const [isSubmitting, toggleSubmitting] = useToggle();

	const removeItem = (item: CartSeat) => {
		if (item.number) {
			// is seat
			apiService
				.unreserve({
					seats: [{ sid: item.seatId }],
				})
				.then((cart) => {
					localCart.decreaseItem(String(item.seatId));
					revalidator.revalidate();

					if (cart.seatList.length === 0) {
						clearInterval(intervalRef.current);
					}
				})
				.catch((err) => {
					setError(err);
				});
		} else {
			// is category
			apiService
				.unreserve({
					seats: [{ sid: item.seatId }],
				})
				.then((cart) => {
					localCart.decreaseItem(
						String(
							item.tariffPlanId
								? `${item.categoryPriceId}:${item.tariffPlanId}`
								: item.categoryPriceId,
						),
					);

					revalidator.revalidate();

					if (cart.seatList.length === 0) {
						clearInterval(intervalRef.current);
					}
				})
				.catch((err) => {
					setError(err);
				});
		}
	};

	// Timer
	useEffect(() => {
		if (timer !== -1) {
			intervalRef.current = setInterval(() => {
				if (timer > 0) {
					setSeconds(timer - 1);
				} else {
					clearInterval(intervalRef.current);
					toggleCanceledCart(true);
					apiService.unreserveAll().then(() => {
						localCart.removeItems();
					});
				}
			}, 1000);

			return () => {
				clearInterval(intervalRef.current);
			};
		}
	}, [timer]);

	const submitForm = (data: {
		totalSum: number;
		currency: string;
		name?: string;
		phone?: string;
	}) => {
		toggleSubmitting(true);
		apiService
			.createOrder({
				sum: String(data.totalSum),
				currency: data.currency,
				name: data.name,
				phone: data.phone,
			})
			.then(({ formUrl }) => {
				location.href = formUrl;
			})
			.catch((err) => {
				if (err instanceof APIError && err.type === "message") {
					toggleAdditionalInfoModal(false);
					setError(err);
				} else {
					throw err;
				}
			})
			.finally(() => {
				toggleSubmitting(false);
			});
	};

	if (data === undefined) {
		return null;
	}

	if (isCanceledCart) {
		return (
			<div className={styles["centered-container"]}>
				<Typography.Text view="primary-medium">
					Время ожидания истекло
				</Typography.Text>
			</div>
		);
	}

	if (data === null) {
		return (
			<div className={styles["centered-container"]}>
				<Space align="center" size="l" className={styles["centered-content"]}>
					<Space align="center" size={"s"}>
						<Typography.TitleMobile tag="h1" view="small" weight="medium">
							Корзина пуста
						</Typography.TitleMobile>

						<Typography.Text view="primary-small">
							Воспользуйтесь нашими подборками, чтобы найти интересное событие в
							городе
						</Typography.Text>
					</Space>
				</Space>

				<Button
					type="button"
					block
					view="primary"
					size="s"
					onClick={() => navigate(-3)}
				>
					Показать подборки
				</Button>
			</div>
		);
	}

	return (
		<Fragment>
			<div className={styles["container"]}>
				<div>
					<Space size="l" fullWidth>
						<Space size="s" fullWidth>
							<div className={styles["header"]}>
								<Space size={4}>
									<Typography.Text view="primary-small" weight="bold">
										{data?.event.name || "Название события"}
									</Typography.Text>

									<Typography.Text
										view="primary-small"
										style={{
											display: "block",
										}}
									>
										{data
											? formatDateTime(data.event.date, {
													day: "numeric",
													weekday: "long",
													month: "long",
													hour: "2-digit",
													minute: "2-digit",
											  })
											: "Дата проведения"}
									</Typography.Text>

									<Typography.Text view="secondary-medium" color="secondary">
										{data.event.address}
									</Typography.Text>
								</Space>
							</div>

							<div className={styles["timer"]}>
								<Typography.Text view="primary-small">
									До окончания бронирования <b>{formatTimer(timer * 1000)}</b>
								</Typography.Text>
							</div>
						</Space>

						<Space size="s" fullWidth>
							<Space size="m" fullWidth>
								{data.actionEventList[0].seatList.map((item) => (
									<div key={item.categoryPriceId} className={styles["row"]}>
										<Space size={0}>
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
										</Space>

										<div className={styles["inner-row-right"]}>
											<Typography.Text>
												{formatPrice({
													amount: item.price,
													currency: data.currency,
												})}
											</Typography.Text>

											{/* <IconButton
												view="tertiary"
												size="xs"
												icon={CrossCircleMIcon}
												onClick={() => removeItem(item)}
											/> */}
										</div>
									</div>
								))}
							</Space>
						</Space>

						<Space size="m" fullWidth>
							<div className={styles["row"]}>
								<Typography.Text view="primary-medium">
									Сервисный сбор
								</Typography.Text>

								<Typography.Text view="primary-medium">
									{formatPrice({
										amount: data.totalServiceCharge,
										currency: data.currency,
									})}
								</Typography.Text>
							</div>

							<div className={styles["row"]}>
								<Typography.Text view="primary-medium">
									Стоимость заказа
								</Typography.Text>

								<Typography.Text view="primary-large" weight="bold">
									{formatPrice({
										amount: data.totalSum + data.totalServiceCharge,
										currency: data.currency,
									})}
								</Typography.Text>
							</div>
						</Space>

						<div className={styles["cashback-container"]}>
							<div className={styles["cashback"]}>
								<i className={styles["cashback-icon"]} />

								<Typography.Text view="primary-medium">
									Кэшбэк {data.cashback}%
								</Typography.Text>
							</div>

							<Typography.Text view="primary-medium">
								{formatPrice({
									amount: (data.totalSum / 100) * data.cashback,
									currency: data.currency,
								})}
							</Typography.Text>
						</div>
					</Space>

					<div className={cx(styles["cashback-annotation"])}>
						<span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								width={24}
								height={24}
								fill="none"
							>
								<path fill="url(#a)" d="M0 0h24v24H0z" />
								<defs>
									<pattern
										id="a"
										width={1}
										height={1}
										patternContentUnits="objectBoundingBox"
									>
										<use xlinkHref="#b" transform="scale(.00781)" />
									</pattern>
									<image
										xlinkHref="data:image/png;base64,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"
										id="b"
										width={128}
										height={128}
									/>
								</defs>
							</svg>
						</span>
						<Typography.Text view="secondary-large">
							Кэшбэк рассчитывается от номинальной стоимости билета и будет
							начислен 10 числа следующего за покупкой месяца
						</Typography.Text>
					</div>
				</div>

				{data.event.fullNameRequired || data.event.phoneRequired ? (
					<Button
						type="button"
						size="m"
						view="accent"
						block
						onClick={() => toggleAdditionalInfoModal(true)}
					>
						Оплатить
					</Button>
				) : (
					<Button
						type="button"
						size="m"
						view="primary"
						block
						loading={isSubmitting}
						onClick={() => {
							submitForm({
								totalSum: data.totalSum,
								currency: data.currency,
							});
						}}
					>
						Оплатить
					</Button>
				)}

				<AdditionalInfoModal
					open={showAdditionalInfoModal}
					onClose={() => toggleAdditionalInfoModal(false)}
					fullNameRequired={data.event.fullNameRequired}
					phoneRequired={data.event.phoneRequired}
					totalSum={data.totalSum}
					currency={data.currency}
					onSubmit={submitForm}
					submitting={isSubmitting}
				/>
			</div>

			<NonCriticalError
				message={error?.advice}
				// advice={error?.advice}
				open={Boolean(error)}
				onClose={() => setError(null)}
				action={{ label: "Продолжить", callback: () => setError(null) }}
			/>
		</Fragment>
	);
};

export const CheckoutViewError: React.FC = () => {
	const navigate = useNavigate();

	return (
		<PageError
			action={{
				label: "Вернуться",
				callback: () => navigate(-1),
			}}
		/>
	);
};

export const Component: React.FC = () => {
	const data = useLoaderData() as CheckoutData;

	usePageSettings({
		pageId: 4,
		pageTitle: "Подтверждение заказа",
	});

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.cart} errorElement={<CheckoutViewError />}>
				{(cart) => <Checkout data={cart} />}
			</Await>
		</Suspense>
	);
};

export const loader: LoaderFunction = () => {
	const cartPromise = apiService.getCart().then((cart) => {
		if (cart.actionEventList.length > 0) {
			const actionEvent = cart.actionEventList[0];

			const [day, mounth, year] = actionEvent.day.split(".");
			const [hours, minutes] = actionEvent.time.split(":");

			const eventDate = new Date(
				`${year}-${mounth}-${day}T${hours}:${minutes}`,
			);

			return {
				...cart,
				event: {
					name: actionEvent.actionName,
					poster: actionEvent.smallPosterUrl,
					address: actionEvent.venueName,
					date: eventDate,
					seatList: actionEvent.seatList,
					fullNameRequired: actionEvent.fullNameRequired,
					phoneRequired: actionEvent.phoneRequired,
					fanIdRequired: actionEvent.fanIdRequired,
				},
			};
		} else {
			return null;
		}
	});

	return defer({
		cart: cartPromise,
	});
};
