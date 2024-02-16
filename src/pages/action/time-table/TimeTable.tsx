import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Divider } from "@alfalab/core-components/divider";
import { Space } from "@alfalab/core-components/space";
import { AScoresCircleMIcon } from "@alfalab/icons-glyph/AScoresCircleMIcon";

import { useActions } from "@/lib/actions/ActionsContext";
import { groupBy } from "@/lib/utils/groupBy";
import { formatDateTime } from "@/lib/utils/formatDate";
import { formatPrice } from "@/lib/utils/formatPrice";
import { ActionExt, Venue } from "@/lib/types";

import { EventItem } from "./EventItem";
import { Selector } from "./selector/Selector";

import styles from "./TimeTable.module.css";

type TimeTableProps = {
	data: ActionExt & {
		actionVenues: Venue[];
	};
};

export const TimeTable: React.FC<TimeTableProps> = ({ data }) => {
	const params = useParams();
	const navigate = useNavigate();
	const { city } = useActions();
	const [month, setMonth] = useState(0);
	const [day, setDay] = useState(0);

	const venuesItems = useMemo(() => {
		return data.actionVenues.map(({ venueId, venueName }) => ({
			id: String(venueId),
			label: venueName,
		}));
	}, [data.actionVenues]);

	const selectedVenue = useMemo(() => {
		const current = venuesItems.find(
			({ id }) => id === params.action?.split("_")[0],
		);

		if (current) {
			return current;
		}

		return null;
	}, [venuesItems, params.action]);

	const selectVenue = (id: string) => {
		navigate(`/city/${city.cityId}/${id}_${data.actionId}`, {
			replace: true,
		});
	};

	const events = useMemo(() => {
		return Object.entries(data.events).map(([key, event]) => ({
			...event,
			date: new Date(Number(key) * 1000),
		}));
	}, [data.events]);

	const monthsItems = useMemo(() => {
		const group = groupBy(events, ({ date }) => {
			const d = new Date(date);
			d.setHours(0, 0, 0, 0);
			d.setDate(1);

			return d.getTime();
		});

		return Object.keys(group).map((mo) => {
			const date = new Date(Number(mo));

			return {
				id: String(date.getTime()),
				label: formatDateTime(date, { month: "long" }),
			};
		});
	}, [events]);

	const selectedMonth = useMemo(() => {
		const current = monthsItems.find(({ id }) => Number(id) === month);

		if (current) {
			return current;
		}

		return monthsItems[0];
	}, [monthsItems, month]);

	const days = useMemo(() => {
		const monthEvents = events.filter(
			({ date }) =>
				date.getMonth() === new Date(Number(selectedMonth.id)).getMonth(),
		);

		const group = groupBy(monthEvents, ({ date }) =>
			new Date(date.setHours(0, 0)).getTime(),
		);

		return Object.keys(group).map((d) => ({
			id: d,
			label: formatDateTime(new Date(Number(d)), {
				weekday: "short",
				day: "numeric",
			}),
		}));
	}, [events, selectedMonth]);

	const selectedDay = useMemo(() => {
		const current = days.find(({ id }) => Number(id) === day);

		if (current) {
			return current;
		}

		return days[0];
	}, [days, day]);

	const eventsForDay = useMemo(() => {
		return events.filter(
			({ date }) =>
				date.getMonth() === new Date(Number(selectedMonth.id)).getMonth() &&
				date.getDate() === new Date(Number(selectedDay.id)).getDate(),
		);
	}, [events, selectedMonth, selectedDay]);

	const isOneTimeEvent =
		monthsItems.length === 1 && days.length === 1 && eventsForDay.length === 1;

	return (
		<div className={styles["container"]}>
			<Space size="l" fullWidth>
				<Space size="s" fullWidth>
					{data.actionVenues.length > 1 && (
						<Selector
							title="Площадка"
							items={venuesItems}
							selectedItem={selectedVenue}
							onSelect={({ id }) => selectVenue(id)}
						/>
					)}

					{monthsItems.length > 1 && (
						<Selector
							title="Месяц"
							items={monthsItems}
							selectedItem={selectedMonth}
							onSelect={({ id }) => setMonth(Number(id))}
						/>
					)}

					{days.length > 1 && (
						<Selector
							title="День"
							items={days}
							selectedItem={selectedDay}
							onSelect={({ id }) => setDay(Number(id))}
						/>
					)}
				</Space>

				{isOneTimeEvent ? (
					<Space
						fullWidth
						size="l"
						className={styles["one-time-event-content"]}
					>
						<div className={styles["one-time-event-row"]}>
							<Typography.Text>Место</Typography.Text>

							<Typography.Text color="secondary" className={styles["value"]}>
								{data.venueName}
							</Typography.Text>
						</div>

						<div className={styles["one-time-event-row"]}>
							<div>
								<Typography.Text>Дата</Typography.Text>
							</div>

							<Typography.Text color="secondary">
								{formatDateTime(new Date(data.from * 1000), {
									day: "numeric",
									month: "long",
									weekday: "short",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</Typography.Text>
						</div>

						{data.minPrice && (
							<div className={styles["one-time-event-row"]}>
								<div>
									<Typography.Text>Цена</Typography.Text>
								</div>

								<Typography.Text color="secondary">
									от {formatPrice({ currency: "RUB", amount: data.minPrice })}
								</Typography.Text>
							</div>
						)}
					</Space>
				) : (
					<Space size={0} fullWidth divider={<Divider />}>
						{eventsForDay.map((data) => (
							<EventItem key={data.actionEventId} data={data} />
						))}
					</Space>
				)}

				<div className={styles["cashback-row"]}>
					<div className={styles["cashback"]}>
						<i className={styles["cashback-icon"]} />
						<Typography.Text view="primary-medium">
							Кэшбэк {data.cashback}%
						</Typography.Text>
					</div>

					{data.minPrice && (
						<Typography.Text color="secondary">
							{`от ${formatPrice({
								amount: (data.minPrice / 100) * data.cashback,
								currency: "RUB",
							})}`}
						</Typography.Text>
					)}
				</div>
			</Space>
		</div>
	);
};
