import { Fragment, Suspense, useMemo, useState } from "react";
import {
	Await,
	LoaderFunction,
	useNavigate,
	useRouteLoaderData,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";
import { Link } from "@alfalab/core-components/link";
import { Divider } from "@alfalab/core-components/divider";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";
import { Spinner } from "@alfalab/core-components/spinner";

import { PageError } from "@/components/error/PageError";
import { usePageSettings } from "@/lib/hooks/usePageSettings";
import { useToggle } from "@/lib/hooks";
import { formatPrice } from "@/lib/utils/formatPrice";
import { apiService } from "@/lib/api";
import { GetTicketsByOrderResult } from "@/lib/types";

// import { EventHeader } from "./event-header/EventHeader";
import { Details } from "./details/Details";
import { Summary } from "./summary/Summary";

import styles from "./TicketView.module.css";

type Ticket = GetTicketsByOrderResult & {
	action: {
		actionName: string;
		poster: string;
		date: Date;
	};
};

type TicketData = {
	ticket: Promise<Ticket>;
};

type TicketProps = {
	data?: Ticket;
};

const Tickets: React.FC<TicketProps> = ({ data }) => {
	const navigate = useNavigate();
	const [isOpenReturnModal, toggleOpenReturnModal] = useToggle(false);
	const [selected, setSelected] = useState<Record<string, boolean>>({});

	const hasSelected = useMemo(() => {
		return Object.values(selected).some((value) => value === true);
	}, [selected]);

	if (data?.statusExtStr === "PROCESSING") {
		return (
			<div className={styles["container"]}>
				<Space fullWidth size="l">
					<Space
						size="s"
						align="center"
						fullWidth
						className={styles["content"]}
					>
						<Spinner visible size="m" className={styles["big-spinner"]} />
						<Typography.TitleMobile tag="h1" view="small" weight="medium">
							Оформляем заказ
						</Typography.TitleMobile>

						<Typography.Text view="primary-small">
							Проверяем данные, это займёт минуту
						</Typography.Text>
					</Space>

					<Button block onClick={() => navigate(".")}>
						№ заказа 3002324
					</Button>

					<Space size="m" fullWidth>
						<div className={styles["row"]}>
							<Typography.Text view="primary-medium">
								Стоимость заказа
							</Typography.Text>

							<Typography.Text view="primary-large" weight="bold">
								{formatPrice({
									amount: data.sum,
									currency: data.currency,
								})}
							</Typography.Text>
						</div>

						<div className={styles["row"]}>
							<Typography.Text view="primary-medium">
								Сервисный сбор
							</Typography.Text>

							<Typography.Text view="primary-medium">
								{formatPrice({
									amount: data.serviceCharge,
									currency: data.currency,
								})}
							</Typography.Text>
						</div>

						<div className={styles["cashback-container"]}>
							<div className={styles["cashback"]}>
								<span className={styles["cashback-icon"]} />

								<Typography.Text view="primary-medium">
									Кэшбэк {data.cashback}%
								</Typography.Text>
							</div>

							<Typography.Text view="primary-medium">
								{formatPrice({
									amount: (data.sum / 100) * data.cashback,
									currency: data.currency,
								})}
							</Typography.Text>
						</div>
					</Space>
				</Space>
			</div>
		);
	}

	return (
		<Fragment>
			<Space fullWidth className={styles["container"]}>
				{/* {data && (
					<EventHeader data={{ ...data.action, cashback: data.cashback }} />
				)} */}

				{data && (
					<Space fullWidth size="l">
						<Details
							data={{
								date: data.action.date,
								orderNo: data.orderId,
							}}
						/>

						<Space fullWidth divider={<Divider />}>
							{data?.ticketList.map((ticket) => (
								<Summary
									selected={Boolean(selected[ticket.ticketId])}
									onSelect={(isSelected) =>
										setSelected((state) => {
											const newState = { ...state };
											newState[ticket.ticketId] = isSelected;

											return newState;
										})
									}
									key={ticket.actionEventId}
									data={{ ...ticket, cashback: data.cashback }}
								/>
							))}
						</Space>

						<Button
							view="secondary"
							size="m"
							block
							onClick={() =>
								navigate(`/city/${localStorage.getItem("city")}`, {
									replace: true,
								})
							}
						>
							К списку событий
						</Button>

						{hasSelected && (
							<Button
								block
								size="s"
								view="primary"
								onClick={() => toggleOpenReturnModal(true)}
							>
								Вернуть выбранные билеты
							</Button>
						)}
					</Space>
				)}
			</Space>

			<BottomSheet
				hasCloser
				open={isOpenReturnModal}
				onClose={() => toggleOpenReturnModal(false)}
				actionButton={
					<Space size="s" fullWidth>
						<Button
							block
							size="s"
							view="primary"
							onClick={() => navigate(`${location.pathname}/refund`)}
						>
							Вернуть билеты
						</Button>
						<Button
							block
							size="s"
							view="secondary"
							onClick={() => toggleOpenReturnModal(false)}
						>
							Назад
						</Button>
					</Space>
				}
				stickyHeader
				usePortal
			>
				<Typography.Text view="primary-small">
					Перед тем как отправить заявку на возврат, прочитайте{" "}
					<Link view="default" href="/refund-policy">
						«правила возврата»
					</Link>
				</Typography.Text>
			</BottomSheet>
		</Fragment>
	);
};

const TicketPageError: React.FC = () => {
	const navigate = useNavigate();

	return (
		<PageError
			action={{
				label: "Продолжить",
				callback: () => navigate("."),
			}}
		/>
	);
};

export const Component: React.FC = () => {
	const data = useRouteLoaderData("ticket") as TicketData;

	usePageSettings({
		pageId: 4,
		pageTitle: "Мои билеты",
	});

	return (
		<Suspense fallback={<Tickets />}>
			<Await resolve={data.ticket} errorElement={<TicketPageError />}>
				{(data) => <Tickets data={data} />}
			</Await>
		</Suspense>
	);
};

function getDate(dateString: string) {
	const [date, time] = dateString.split(" ");
	const [day, mounth, year] = date.split(".");
	const [hours, minutes] = time.split(":");

	return new Date(`${year}-${mounth}-${day}T${hours}:${minutes}`);
}

export const loader: LoaderFunction = ({ params }) => {
	const ticketPromise = apiService
		.getTicketsByOrder({
			oid: Number(params.oid),
		})
		.then((data) => {
			const ticket = data.ticketList[0];

			return {
				...data,
				action: {
					actionName: ticket.actionName,
					poster: ticket.smallPosterUrl,
					date: getDate(ticket.date),
				},
			};
		});

	return {
		ticket: ticketPromise,
	};
};
