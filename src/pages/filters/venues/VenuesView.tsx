import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@alfalab/core-components/button";
import { Typography } from "@alfalab/core-components/typography";
import { CheckboxGroup } from "@alfalab/core-components/checkbox-group";
import { Checkbox } from "@alfalab/core-components/checkbox";
import { Input } from "@alfalab/core-components/input";
import MagnifierMIcon from "@alfalab/icons-glyph/MagnifierMIcon";

import { useActions } from "@/lib/actions/ActionsContext";
import { placesHistory } from "@/lib/placesHistory";
import { usePageSettings } from "@/lib/hooks";
// import { MAX_POPULAR_PLACES } from "@/lib/constants";
import { Venue } from "@/lib/types";

import styles from "./VenuesView.module.css";

function getHighlightedText(text: string, highlight: string) {
	const parts = text.split(new RegExp(`( |^|-|«)(${highlight})`, "gi"));

	return (
		<span>
			{" "}
			{parts.map((part, i) => (
				<span
					key={`${i}`}
					style={
						part.toLowerCase() === highlight.toLowerCase()
							? { fontWeight: "bold" }
							: {}
					}
				>
					{part}
				</span>
			))}{" "}
		</span>
	);
}

function getPlaceFilter(cityVenues: Venue[], args?: { query: string }) {
	const rx = args ? new RegExp(`( |^|-|«)${args.query}`, "gi") : null;

	return ({ venueId, venueName }: Venue) => {
		const queryMatched = rx ? rx.test(venueName) : true;
		const cityMatched = cityVenues.some((venue) => venue.venueId === venueId);

		return queryMatched && cityMatched;
	};
}

export const FiltersVenuesView: React.FC = () => {
	const navigate = useNavigate();
	const { city, filters, venues: cityVenues, setFilters } = useActions();
	const [query, setQuery] = useState("");
	const [places, setPlaces] = useState<Venue[]>(filters.venues);

	usePageSettings({
		pageId: 5,
		pageTitle: "Место проведения",
	});

	const results = useMemo(() => {
		return cityVenues.filter(getPlaceFilter(cityVenues, { query }));
	}, [query, cityVenues]);

	const popular = useMemo(() => {
		return cityVenues;
	}, [cityVenues]);

	const handleChange = useCallback(
		(payload: { name: string; checked: boolean }) => {
			setPlaces((state) => {
				if (payload.checked === false) {
					return state.filter(
						({ venueId }) => venueId !== Number(payload.name),
					);
				} else {
					const place = cityVenues.find(
						({ venueId }) => venueId === Number(payload.name),
					);

					return place ? [...state, place] : state;
				}
			});
		},
		[places],
	);

	const clear = () => {
		setPlaces([]);
	};

	const apply = () => {
		setFilters({
			...filters,
			venues: places,
		});

		placesHistory.addItems(places);

		navigate(`/city/${city.cityId}/filters`);
	};

	return (
		<div className={styles["container"]}>
			<Input
				placeholder="Место проведения"
				size="s"
				block
				leftAddons={
					<MagnifierMIcon color="var(--color-dark-graphic-secondary)" />
				}
				clear={true}
				value={query}
				onChange={({ target }) => setQuery(target.value)}
				onClear={() => setQuery("")}
				className={styles["input"]}
			/>

			<div className={styles["content"]}>
				{query !== "" ? (
					<div>
						{results.length === 0 ? (
							<Typography.Text>Нет результатов</Typography.Text>
						) : (
							<CheckboxGroup
								onChange={(_, { name, checked }) => {
									if (name) {
										handleChange({ name, checked });
									}
								}}
							>
								{results.map(({ venueId, venueName }) => (
									<Checkbox
										key={venueId}
										size="m"
										label={
											query ? getHighlightedText(venueName, query) : venueName
										}
										name={venueId.toString()}
										checked={
											places.findIndex((venue) => venue.venueId === venueId) !==
											-1
										}
									/>
								))}
							</CheckboxGroup>
						)}
					</div>
				) : (
					<CheckboxGroup
						onChange={(_, { name, checked }) => {
							if (name) {
								handleChange({ name, checked });
							}
						}}
					>
						{popular.map((venue) => (
							<Checkbox
								key={venue.venueId}
								size="m"
								label={venue.venueName}
								name={venue.venueId.toString()}
								checked={
									places.findIndex(
										({ venueId }) => venueId === venue.venueId,
									) !== -1
								}
							/>
						))}
					</CheckboxGroup>
				)}
			</div>

			<div className={styles["button-group"]}>
				{places.length > 0 && (
					<Button view="secondary" size="s" block onClick={clear}>
						Сбросить
					</Button>
				)}
				<Button view="primary" size="s" block onClick={apply}>
					Применить
				</Button>
			</div>
		</div>
	);
};
