import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@alfalab/core-components/input";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { CheckboxGroup } from "@alfalab/core-components/checkbox-group";
import { Checkbox } from "@alfalab/core-components/checkbox";
import MagnifierMIcon from "@alfalab/icons-glyph/MagnifierMIcon";

import { usePageSettings } from "@/lib/hooks";
import { useActions } from "@/lib/actions/ActionsContext";
import { Genre } from "@/lib/types";

import styles from "./GenresView.module.css";

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

function getGenresFilter(cityVenues: Genre[], args?: { query: string }) {
	const rx = args ? new RegExp(`( |^|-|«)${args.query}`, "gi") : null;

	return ({ genreId, genreName }: Genre) => {
		const queryMatched = rx ? rx.test(genreName) : true;
		const cityMatched = cityVenues.some((venue) => venue.genreId === genreId);

		return queryMatched && cityMatched;
	};
}

export const FiltersGenresView: React.FC = () => {
	const navigate = useNavigate();
	const { city, genres: cityGenres, filters, setFilters } = useActions();
	const [query, setQuery] = useState("");
	const [genres, setGenres] = useState<Record<number, boolean>>(filters.genres);

	usePageSettings({
		pageId: 5,
		pageTitle: "Вид события",
	});

	const results = useMemo(() => {
		return cityGenres.filter(getGenresFilter(cityGenres, { query }));
	}, [query]);

	const handleChange = useCallback(
		(payload: { name: string; checked: boolean }) => {
			const genresToUpdate = {
				...genres,
				[Number(payload.name)]: payload.checked,
			};

			if (!payload.checked) {
				delete genresToUpdate[Number(payload.name)];
			}

			setGenres(genresToUpdate);
		},
		[genres],
	);

	const clear = () => {
		setGenres({});
	};

	const apply = () => {
		setFilters({
			...filters,
			genres,
		});

		navigate(`/city/${city.cityId}/filters`);
	};

	return (
		<div className={styles["container"]}>
			<Input
				placeholder="Название"
				size="s"
				block
				leftAddons={
					<MagnifierMIcon color="var(--color-dark-graphic-secondary)" />
				}
				clear={true}
				value={query}
				className={styles["input"]}
				onChange={(_, { value }) => setQuery(value)}
				onClear={() => setQuery("")}
			/>

			<div className={styles["content"]}>
				{cityGenres.length === 0 ? (
					<Typography.Text>Нет жанров</Typography.Text>
				) : (
					<div>
						{query !== "" ? (
							<CheckboxGroup
								onChange={(_, { name, checked }) => {
									if (name) {
										handleChange({ name, checked });
									}
								}}
							>
								{results.map(({ genreId, genreName }) => (
									<Checkbox
										key={genreId}
										size="m"
										label={
											query ? getHighlightedText(genreName, query) : genreName
										}
										name={genreId.toString()}
										checked={genres[genreId] ?? false}
									/>
								))}
							</CheckboxGroup>
						) : (
							<CheckboxGroup
								onChange={(_, { name, checked }) => {
									if (name) {
										handleChange({ name, checked });
									}
								}}
							>
								{cityGenres.map(({ genreId, genreName }) => (
									<Checkbox
										key={genreId}
										size="m"
										label={genreName}
										name={genreId.toString()}
										checked={genres[genreId] ?? false}
									/>
								))}
							</CheckboxGroup>
						)}
					</div>
				)}
			</div>

			<div className={styles["button-group"]}>
				{Object.values(genres).filter((val) => val === true).length > 0 && (
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
