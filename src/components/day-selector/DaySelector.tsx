import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import ScrollContainer from "react-indiana-drag-scroll";
import { Typography } from "@alfalab/core-components/typography";
import { usePeriod } from "@alfalab/core-components/calendar/shared";
import { ChevronDownCompactMIcon } from "@alfalab/icons-glyph/ChevronDownCompactMIcon";
import {
	addDays,
	isSameDay,
	startOfDay,
	endOfDay,
	format,
	isToday,
} from "date-fns";
import cx from "classnames";
import { ru } from "date-fns/locale";

import { Calendar } from "@/components/calendar";
import { useActions } from "@/lib/actions/ActionsContext";
import {
	NodesContext,
	NodesContextProvider,
	NodeItem,
} from "@/components/nodes/NodesContext";
import { groupBy } from "@/lib/utils/groupBy";
import { Day } from "@/lib/utils/date";
import { useToggle } from "@/lib/hooks";

import styles from "./DaySelector.module.css";
import { formatDateTime } from "@/lib/utils/formatDate";

const DAYS_COUNT = 100;
const DAYS_TEMPLATE = [...new Array(DAYS_COUNT)];

type RangeSegment = "start" | "middle" | "end";

function getDate(
	shortcut: "today" | "tomorow" | "weekends" | Date,
): [Date, Date] {
	let date: Date;

	if (typeof shortcut === "string") {
		switch (shortcut) {
			case "today": {
				date = new Date();
				break;
			}
			case "tomorow": {
				date = new Date(new Date().getTime() + Day);
				break;
			}
			case "weekends": {
				const day = new Date().getDay();

				if (day === 6 || day === 0) {
					date = new Date();
				} else {
					date = new Date(new Date().getTime() + Day * (6 - day));
				}
				break;
			}
		}
	} else {
		date = shortcut;
	}

	date.setHours(0, 0, 0, 0);

	return shortcut === "weekends" && date.getDay() === 6
		? [date, startOfDay(addDays(date, 1))]
		: [date, endOfDay(date)];
}

function getRangeSegmentType(
	[start, end]: [number, number],
	date: Date,
): RangeSegment | undefined {
	const d = date.getTime();

	if (d === start) {
		return "start";
	}

	if (start < d && d < end) {
		return "middle";
	}

	if (isSameDay(d, end)) {
		return "end";
	}

	return undefined;
}

type DayItemProps = {
	day: Date;
	label: string;
	active?: boolean;
	rangeSegment?: RangeSegment;
	onClick(): void;
};

const DayItem: React.FC<DayItemProps> = ({
	day,
	label,
	active = false,
	rangeSegment,
	onClick,
}) => {
	return (
		<button
			type="button"
			id={String(day.getTime())}
			onClick={onClick}
			className={cx(
				styles["tab"],
				active && styles["tab-active"],
				isToday(day) && styles["tab-today"],
				rangeSegment && styles[`range-${rangeSegment}`],
			)}
		>
			<Typography.Text
				view="caps"
				color="secondary"
				className={styles["day-title"]}
			>
				{formatDateTime(day, { weekday: "short" })}
			</Typography.Text>

			<div className={styles["day-container"]}>
				<div className={styles["day"]}>
					<Typography.Text view="primary-medium" weight="bold">
						{label}
					</Typography.Text>
				</div>
			</div>
		</button>
	);
};

export const DaySelector: React.FC = () => {
	const containerRef = useRef<HTMLElement | null>(null);
	const nodesRef = useRef(new Map<string, HTMLDivElement>());
	const [currentMouth, setCurrentMouth] = useState(new Date());
	const { filters, setFilters } = useActions();
	const [isOpenCalendar, toggleOpenCalendar] = useToggle(false);
	const {
		selectedFrom: selectedDateFrom,
		selectedTo: selectedDateTo,
		updatePeriod,
		setStart,
		setEnd,
		resetPeriod,
	} = usePeriod({
		onPeriodChange(selectedFrom, selectedTo) {
			let date: [Date] | [Date, Date] | null = null;

			if (selectedFrom && selectedTo) {
				date = [new Date(selectedFrom), new Date(selectedTo)];
			} else if (selectedFrom) {
				date = [new Date(selectedFrom)];
			}

			setFilters((state) => ({
				...state,
				date,
			}));

			if (date && isOpenCalendar) {
				const id = date[0].getTime().toString();
				const el = document.getElementById(id);

				el?.scrollIntoView({
					behavior: "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		},
		initialSelectedFrom: filters.date?.[0].getTime(),
		initialSelectedTo: filters.date?.[1]?.getTime(),
	});

	const selectDay = (date: [Date] | [Date, Date], first?: true) => {
		const [firstDate, lastDate] = date;
		const d = firstDate.getTime();

		if (
			firstDate.getTime() === selectedDateFrom &&
			lastDate?.getTime() === selectedDateTo
		) {
			return resetPeriod();
		}

		if (first) {
			resetPeriod();
			setStart(d);

			if (d) {
				const id = d.toString();
				const el = document.getElementById(id);

				if (lastDate) {
					setEnd(lastDate.getTime());
				}

				el?.scrollIntoView({
					behavior: "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		} else if (selectedDateFrom && selectedDateTo) {
			resetPeriod();
			setStart(d);
		} else if (d === selectedDateFrom) {
			resetPeriod();
		} else {
			updatePeriod(d);
		}
	};

	const days = useMemo(() => {
		const now = new Date();
		const _days = DAYS_TEMPLATE.map((_, idx) => {
			const day = new Date(now.getTime() + Day * idx);
			day.setHours(0, 0, 0, 0);
			const mo = day.getMonth();

			return {
				day,
				mo,
			};
		});

		return Object.values(groupBy(_days, ({ mo }) => mo)).sort(
			(a, b) => a[0].day.getTime() - b[0].day.getTime(),
		);
	}, []);

	const getCurrentMouth = () => {
		if (containerRef.current) {
			let accWidth = 0;

			for (const [moKey, element] of nodesRef.current) {
				accWidth = accWidth + element.clientWidth;
				if (containerRef.current?.scrollLeft < accWidth) {
					const date = new Date();
					date.setMonth(Number(moKey));
					setCurrentMouth(date);

					break;
				}
			}
		}
	};

	const registerItem = useCallback<NodesContext["registerItem"]>(
		({ id, ref }) => {
			nodesRef.current.set(id, ref);
		},
		[],
	);

	const unregisterItem = useCallback<NodesContext["unregisterItem"]>((id) => {
		nodesRef.current.delete(id);
	}, []);

	const handleCloseCalendar = () => {
		toggleOpenCalendar(false);
	};

	useEffect(() => {
		if (filters.date) {
			const id = String(filters.date[0].getTime());
			const el = document.getElementById(id);

			el?.scrollIntoView({
				behavior: "instant",
				inline: "center",
				block: "nearest",
			});
		}
	}, []);

	return (
		<div className={styles["container"]}>
			<ScrollContainer className={styles["shortcuts"]}>
				<button
					type="button"
					onClick={() => toggleOpenCalendar(true)}
					className={styles["chip"]}
				>
					<Typography.Text view="primary-small">
						{format(selectedDateFrom || currentMouth, "LLLL", { locale: ru })}
					</Typography.Text>
					<ChevronDownCompactMIcon />
				</button>

				<button
					type="button"
					onClick={() => selectDay(getDate("today"), true)}
					className={cx(
						styles["chip"],
						selectedDateFrom === getDate("today")[0].getTime() &&
							selectedDateTo === getDate("today")[1].getTime() &&
							styles["chip-active"],
					)}
				>
					<Typography.Text view="primary-small">Сегодня</Typography.Text>
				</button>

				<button
					type="button"
					onClick={() => selectDay(getDate("tomorow"), true)}
					className={cx(
						styles["chip"],
						selectedDateFrom === getDate("tomorow")[0].getTime() &&
							selectedDateTo === getDate("tomorow")[1].getTime() &&
							styles["chip-active"],
					)}
				>
					<Typography.Text view="primary-small">Завтра</Typography.Text>
				</button>

				<button
					type="button"
					onClick={() => selectDay(getDate("weekends"), true)}
					className={cx(
						styles["chip"],
						selectedDateFrom === getDate("weekends")[0].getTime() &&
							selectedDateTo === getDate("weekends")[1].getTime() &&
							styles["chip-active"],
					)}
				>
					<Typography.Text view="primary-small">В выходные</Typography.Text>
				</button>
			</ScrollContainer>

			<NodesContextProvider value={{ registerItem, unregisterItem }}>
				<ScrollContainer
					innerRef={containerRef}
					onScroll={() => getCurrentMouth()}
					className={styles["scroll-container"]}
				>
					{Object.values(days).map((arr, idx) => (
						<NodeItem id={String(arr[0]["mo"])} key={`month-${idx}`}>
							<div className={styles["days"]}>
								{arr.map(({ day }) => (
									<DayItem
										key={day.getTime()}
										day={day}
										label={String(day.getDate())}
										active={
											selectedDateFrom === day.getTime() ||
											Boolean(selectedDateTo && isSameDay(selectedDateTo, day))
										}
										rangeSegment={
											selectedDateFrom &&
											selectedDateTo &&
											!isSameDay(selectedDateFrom, selectedDateTo)
												? getRangeSegmentType(
														[selectedDateFrom, selectedDateTo],
														day,
												  )
												: undefined
										}
										onClick={() => selectDay([day])}
									/>
								))}
							</div>
						</NodeItem>
					))}
				</ScrollContainer>
			</NodesContextProvider>

			{isOpenCalendar && (
				<Calendar
					selectedFrom={selectedDateFrom}
					selectedTo={selectedDateTo}
					selectDay={selectDay}
					updatePeriod={updatePeriod}
					onClose={handleCloseCalendar}
				/>
			)}
		</div>
	);
};
