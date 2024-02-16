import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePeriodWithReset } from "@alfalab/core-components/calendar/shared";

import { Calendar } from "@/components/calendar";
import { useActions } from "@/lib/actions/ActionsContext";
import { usePageSettings } from "@/lib/hooks";

export const FiltersDateView: React.FC = () => {
	const navigate = useNavigate();
	const { city, filters, setFilters } = useActions();
	const [date, setDate] = useState<[Date] | [Date, Date] | null>(filters.date);
	const {
		selectedFrom: selectedDateFrom,
		selectedTo: selectedDateTo,
		updatePeriod,
		resetPeriod,
		setStart,
		setEnd,
	} = usePeriodWithReset({
		onPeriodChange(selectedFrom, selectedTo) {
			if (selectedFrom && selectedTo) {
				setDate([new Date(selectedFrom), new Date(selectedTo)]);
			} else if (selectedFrom) {
				setDate([new Date(selectedFrom)]);
			} else {
				setDate(null);
			}
		},
		initialSelectedFrom: date?.[0].getTime(),
		initialSelectedTo: date?.[1]?.getTime(),
	});

	usePageSettings({
		pageId: 5,
		pageTitle: "Выбор даты",
	});

	const selectDay = (date: [Date] | [Date, Date], first?: true) => {
		const [firstDate, lastDate] = date;
		const d = firstDate?.getTime();

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

				setTimeout(() => {
					el?.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
						inline: "start",
					});
				}, 100);
			}
		} else if (
			(d === selectedDateFrom && selectedDateTo) ||
			d === selectedDateTo
		) {
			setStart(d);
			setEnd();
		} else if (d === selectedDateFrom) {
			resetPeriod();
		} else {
			updatePeriod(d);
		}
	};

	const handleClose = () => {
		setFilters({
			...filters,
			date,
		});
		navigate(`/city/${city.cityId}/filters`);
	};

	return (
		<Calendar
			onClose={handleClose}
			selectedFrom={selectedDateFrom}
			selectedTo={selectedDateTo}
			updatePeriod={updatePeriod}
			selectDay={selectDay}
		/>
	);
};
