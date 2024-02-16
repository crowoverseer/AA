import { Fragment, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@alfalab/core-components/input";
import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { Divider } from "@alfalab/core-components/divider";
import { isSameDay } from "date-fns";

import { MAX_SEARCH_RESULTS } from "@/lib/constants";
import { formatString } from "@/lib/utils/formatString";
import { useActions } from "@/lib/actions/ActionsContext";
import { usePageSettings } from "@/lib/hooks";

import styles from "./SearchView.module.css";

function getFormattedDate(args: {
	firstDate: Date;
	lastDate: Date;
	time?: string;
}): string {
	const formatterOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
	};

	if (isSameDay(args.firstDate, args.lastDate)) {
		const date = args.firstDate;

		if (args.time) {
			const [hour, min] = args.time.split(":");
			date.setHours(Number(hour), Number(min));
			formatterOptions.hour = "2-digit";
			formatterOptions.minute = "2-digit";
		}

		const formatter = new Intl.DateTimeFormat("ru", formatterOptions);

		return formatter.format(args.firstDate);
	} else {
		const formatter = new Intl.DateTimeFormat("ru", formatterOptions);

		return `${formatter.format(args.firstDate)} - ${formatter.format(
			args.lastDate,
		)}`;
	}
}

function getHighlightedText(text: string, highlight: string) {
	const parts = text.split(new RegExp(`(?<![A-zА-я0-9])(${highlight})`, "gi"));

	return (
		<Fragment>
			{" "}
			{parts.map((part, idx) => (
				<span
					key={part + idx}
					style={
						part.toLowerCase().trim().startsWith(highlight.trim().toLowerCase())
							? { fontWeight: "bold" }
							: {}
					}
				>
					{part}
				</span>
			))}{" "}
		</Fragment>
	);
}

export const Component: React.FC = () => {
	const { city, actions } = useActions();
	const [query, setQuery] = useState("");
	const searchInputRef = useRef<HTMLInputElement | null>(null);

	usePageSettings({
		pageId: 4,
		pageTitle: "Поиск",
	});

	const searchResults = useMemo(() => {
		return query !== ""
			? actions
					.filter(({ actionName }) => {
						return new RegExp(`((\\s|^|«|"|')${query.toLowerCase()}).*`).test(
							actionName.toLowerCase(),
						);
					})
					.slice(-MAX_SEARCH_RESULTS)
					.sort((a, b) => a.actionName.localeCompare(b.actionName))
					.map((action) => ({
						...action,
						actionName: formatString(action.actionName),
					}))
			: [];
	}, [actions, query]);

	return (
		<div className={styles["container"]}>
			<Input
				ref={searchInputRef}
				placeholder={city ? `Поиск в ${city.cityName}` : "Поиск"}
				size="s"
				block
				clear
				autoFocus
				value={query}
				onChange={({ target }) => setQuery(target.value)}
				onClear={() => setQuery("")}
			/>

			{query !== "" && (
				<div className={styles["results-container"]}>
					{searchResults.length === 0 ? (
						<Typography.Text className={styles["not-found-message"]}>
							Ничего ничего не найдено
						</Typography.Text>
					) : (
						<Space size={0} fullWidth divider={<Divider />}>
							{searchResults.map((action) => (
								<Link
									key={action.actionId}
									className={styles["list-item"]}
									to={`/city/${city.cityId}/${action.venues[0].venueId}_${action.actionId}`}
								>
									<Typography.TitleMobile
										view="xsmall"
										weight="regular"
										tag="h5"
									>
										{getHighlightedText(action.actionName, query)}
									</Typography.TitleMobile>

									<Typography.Text view="primary-small">
										{getFormattedDate({
											firstDate: new Date(action.from * 1000),
											lastDate: new Date(action.to * 1000),
											time: action.time,
										})}
									</Typography.Text>

									<Typography.Text view="primary-small" color="secondary">
										{formatString(
											Object.values(action.venues)
												.map(({ venueName }) => venueName)
												.join(", "),
										)}
									</Typography.Text>
								</Link>
							))}
						</Space>
					)}
				</div>
			)}
		</div>
	);
};
