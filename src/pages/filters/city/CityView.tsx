import { Fragment, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@alfalab/core-components/input";
import { Space } from "@alfalab/core-components/space";
import { Typography } from "@alfalab/core-components/typography";
import { Radio } from "@alfalab/core-components/radio";
import { Button } from "@alfalab/core-components/button";
import { MagnifierMIcon } from "@alfalab/icons-glyph/MagnifierMIcon";
import { ChevronDownCompactMIcon } from "@alfalab/icons-glyph/ChevronDownCompactMIcon";

import { usePageSettings, useToggle } from "@/lib/hooks";
import { useCities } from "@/lib/city/CityContext";
import { citiesHistory } from "@/lib/citiesHistory";
import { City } from "@/lib/types";

import styles from "./CityView.module.css";

function getHighlightedText(text: string, highlight: string) {
	const parts = text.split(new RegExp(`^(${highlight})`, "gi"));

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

type CityItemProps = {
	name: React.ReactNode;
	selected: boolean;
	readOnly: boolean;
	description?: string;
	expandedByDefault?: boolean;
	onSelect: () => void;
	children?: React.ReactNode;
};

const CityItem: React.FC<CityItemProps> = ({
	name,
	selected,
	readOnly,
	description,
	expandedByDefault = false,
	onSelect,
	children,
}) => {
	const [isOpen, toggleOpen] = useToggle(expandedByDefault);
	const hasChildrens = Boolean(children);

	return (
		<div>
			<div className={styles["city-item"]}>
				<Radio
					size="m"
					checked={selected}
					onChange={onSelect}
					label={name}
					block={true}
					hint={description}
					className={readOnly ? styles["radio-inactive"] : ""}
					circleClassName={styles["radio-circle"]}
					contentClassName={styles["radio-content"]}
				/>

				{hasChildrens && (
					<button type="button" onClick={() => toggleOpen()}>
						<ChevronDownCompactMIcon
							style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
						/>
					</button>
				)}
			</div>

			{hasChildrens && isOpen && (
				<div className={styles["city-item-child"]}>{children}</div>
			)}
		</div>
	);
};

type FiltersCityViewProps = {
	pageId?: number;
	withoutHistory?: boolean;
};

export const FiltersCityView: React.FC<FiltersCityViewProps> = ({
	pageId = 5,
	withoutHistory,
}) => {
	const { cities, cityId, selectCity } = useCities();
	const [query, setQuery] = useState("");
	const [selectedCityId, setSelectedCityId] = useState<number | null>(cityId);

	usePageSettings({
		pageId,
		pageTitle: "Укажите город",
	});

	const flattenCities = useMemo(() => {
		return cities.reduce((acc, city) => {
			acc.push({
				cityId: city.cityId,
				cityName: city.cityName,
			});

			if (city.towns) {
				for (const town of city.towns) {
					acc.push({
						cityId: town.cityId,
						cityName: town.cityName,
					});
				}
			}

			return acc;
		}, [] as Array<{ cityId: number; cityName: string }>);
	}, [cities]);

	const select = (cityId: number) => {
		const city = flattenCities.find((city) => city.cityId === cityId);

		if (city) {
			selectCity(city);
		}
	};

	const results = useMemo(() => {
		return cities
			.reduce((acc, item) => {
				acc.push({ cityId: item.cityId, cityName: item.cityName });

				if (item.towns) {
					for (const tow of item.towns) {
						acc.push({ cityId: tow.cityId, cityName: tow.cityName });
					}
				}

				return acc;
			}, [] as City[])
			.filter(({ cityName }) =>
				cityName.toLowerCase().startsWith(query.toLowerCase()),
			);
	}, [cities, query]);

	const history = useMemo(() => {
		return citiesHistory
			.getItems()
			.filter(({ cityId }) =>
				cities.map((city) => city.cityId).includes(cityId),
			);
	}, [cities]);

	return (
		<div className={styles["container"]}>
			<Input
				placeholder="Город"
				size="s"
				block
				leftAddons={
					<MagnifierMIcon color="var(--color-dark-graphic-secondary)" />
				}
				clear={true}
				value={query}
				onChange={({ target }) => {
					setSelectedCityId(null);
					setQuery(target.value);
				}}
				onClear={() => {
					setSelectedCityId(null);
					setQuery("");
				}}
				className={styles["input"]}
			/>

			<div className={styles["content"]}>
				{query !== "" ? (
					<Space size={0} fullWidth>
						{results.map((city) => (
							<CityItem
								key={city.cityId}
								name={getHighlightedText(city.cityName, query)}
								readOnly={city.cityId === 0}
								selected={selectedCityId === city.cityId}
								onSelect={() => setSelectedCityId(city.cityId)}
							/>
						))}
					</Space>
				) : (
					<div>
						{!withoutHistory && history.length > 0 && (
							<div>
								<Typography.TitleMobile
									tag="h5"
									view="xsmall"
									weight="bold"
									style={{ padding: "16px 0" }}
								>
									История
								</Typography.TitleMobile>

								<Space size={0} fullWidth>
									{history.map((city) => (
										<CityItem
											key={city.cityId}
											name={city.cityName}
											readOnly={city.cityId === 0}
											selected={selectedCityId === city.cityId}
											onSelect={() => setSelectedCityId(city.cityId)}
										/>
									))}
								</Space>
							</div>
						)}

						<Typography.TitleMobile
							tag="h5"
							view="xsmall"
							weight="bold"
							style={{ padding: "16px 0" }}
						>
							Все города
						</Typography.TitleMobile>

						<Space size={0} fullWidth>
							{cities.map((city) => (
								<CityItem
									key={city.cityId}
									name={city.cityName}
									readOnly={city.link === 0}
									selected={city.cityId === selectedCityId}
									expandedByDefault={city.towns?.some(
										({ cityId }) => cityId === selectedCityId,
									)}
									onSelect={() => setSelectedCityId(city.cityId)}
								>
									{city.towns && (
										<Fragment>
											{city.towns.map(({ cityId, cityName, region }) => (
												<CityItem
													key={cityId}
													name={cityName}
													description={region}
													readOnly={city.cityId === 0}
													selected={cityId === selectedCityId}
													onSelect={() => setSelectedCityId(cityId)}
												/>
											))}
										</Fragment>
									)}
								</CityItem>
							))}
						</Space>
					</div>
				)}

				{selectedCityId && (
					<Button
						type="button"
						block
						size="s"
						view="primary"
						onClick={() => select(selectedCityId)}
						className={styles["action-button"]}
					>
						Продолжить
					</Button>
				)}
			</div>
		</div>
	);
};
