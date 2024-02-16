import ScrollContainer from "react-indiana-drag-scroll";
import { Typography } from "@alfalab/core-components/typography";
import { addDays, endOfDay, startOfDay } from "date-fns";
import cx from "classnames";

import { CalendarMobile } from "./components/calendar-mobile";
import { Day } from "@/lib/utils/date";

import styles from "./Calendar.module.css";

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

type CalendarProps = {
	selectedFrom: number | undefined;
	selectedTo: number | undefined;
	updatePeriod: (date?: number | undefined) => void;
	selectDay: (date: [Date] | [Date, Date], first?: true) => void;
	onClose: () => void;
};

export const Calendar: React.FC<CalendarProps> = ({
	selectedFrom,
	selectedTo,
	updatePeriod,
	selectDay,
	onClose,
}) => {
	return (
		<CalendarMobile
			open
			onClose={onClose}
			selectedFrom={selectedFrom}
			selectedTo={selectedTo}
			onChange={updatePeriod}
			minDate={new Date().getTime()}
			allowSelectionFromEmptyRange
			selectorView="month-only"
			yearsAmount={1}
			headerSlot={
				<ScrollContainer className={styles["shortcuts"]}>
					<button
						type="button"
						onClick={() => selectDay(getDate("today"), true)}
						className={cx(
							styles["chip"],
							selectedFrom === getDate("today")[0].getTime() &&
								selectedTo === getDate("today")[1].getTime() &&
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
							selectedFrom === getDate("tomorow")[0].getTime() &&
								selectedTo === getDate("tomorow")[1].getTime() &&
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
							selectedFrom === getDate("weekends")[0].getTime() &&
								selectedTo === getDate("weekends")[1].getTime() &&
								styles["chip-active"],
						)}
					>
						<Typography.Text view="primary-small">В выходные</Typography.Text>
					</button>
				</ScrollContainer>
			}
		/>
	);
};
