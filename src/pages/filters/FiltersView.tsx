import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Space } from "@alfalab/core-components/space";
import { Button } from "@alfalab/core-components/button";
import { PureCell } from "@alfalab/core-components/pure-cell";
import ChevronRightShiftIcon from "@alfalab/icons-glyph/ChevronRightShiftRightSIcon";
import { isSameDay } from "date-fns";

import { useActions } from "@/lib/actions/ActionsContext";
import { usePageSettings } from "@/lib/hooks";
import { formatDateTime } from "@/lib/utils/formatDate";

import styles from "./FiltersView.module.css";

function substring(str: string, limit: number) {
	return str.length > limit ? `${str.substring(0, limit)} ...` : str;
}

function formatSelectedNames(names: string[]) {
	if (names.length !== 0) {
		const firstName = names[0];
		const CHAR_LIMIT = 12;

		return names.length > 1
			? `${substring(firstName, CHAR_LIMIT)}, и еще ${names.length - 1}`
			: substring(firstName, CHAR_LIMIT);
	} else {
		return "";
	}
}

function formatSelectedDates(dates: [Date] | [Date, Date] | null) {
	if (dates) {
		const formatOptions = {
			day: "numeric",
			month: "long",
		} as const;

		if (dates.length === 1 || isSameDay(dates[0], dates[1])) {
			return formatDateTime(dates[0], formatOptions);
		} else {
			return `${formatDateTime(dates[0], formatOptions)} - ${formatDateTime(
				dates[1],
				formatOptions,
			)}`;
		}
	} else {
		return "";
	}
}

type MenuItemProps = {
	label: React.ReactNode;
	value?: string;
	onClick(): void;
};

const MenuItem: React.FC<MenuItemProps> = ({ label, value, onClick }) => {
	return (
		<button type="button" className={styles["menu-item"]} onClick={onClick}>
			<PureCell direction="horizontal" verticalPadding="default">
				<PureCell.Content>
					<PureCell.Main>
						<PureCell.Text
							titleColor="primary"
							valueColor="secondary"
							view="component-primary"
							value={value}
						>
							{label}
						</PureCell.Text>
					</PureCell.Main>
				</PureCell.Content>
				<PureCell.Addon verticalAlign="center">
					<ChevronRightShiftIcon fill="rgba(116, 116, 116, 1)" />
				</PureCell.Addon>
			</PureCell>
		</button>
	);
};

type Tags = {
	popular: boolean;
	month: boolean;
	weekend: boolean;
};

export const FiltersView: React.FC = () => {
	const navigate = useNavigate();
	const { city, genres, filters, setFilters, resetFilters, totalFiltersCount } =
		useActions();
	const [tags, setTags] = useState<Tags>({
		month: filters.month,
		popular: filters.popular,
		weekend: filters.weekend,
	});

	usePageSettings({
		pageId: 4,
		pageTitle: "Фильтр",
	});

	const apply = useCallback(() => {
		setFilters((state) => ({
			...state,
			...tags,
		}));

		navigate(`/city/${city.cityId}`);
	}, [tags, city.cityId, navigate, setFilters]);

	const reset = useCallback(() => {
		resetFilters();
		setTags({
			month: false,
			popular: false,
			weekend: false,
		});
	}, [resetFilters]);

	return (
		<div className={styles["container"]}>
			<div>
				<Space size={0} fullWidth className={styles["menu"]}>
					<MenuItem
						label="Город"
						value={city.cityName}
						onClick={() => navigate(`${location.pathname}/city`)}
					/>
					<MenuItem
						label="Категории"
						value={formatSelectedNames(
							genres
								.filter(({ genreId }) => filters.genres[genreId])
								.map(({ genreName }) => genreName),
						)}
						onClick={() => navigate(`${location.pathname}/genres`)}
					/>
					<MenuItem
						label="Площадки"
						value={formatSelectedNames(
							filters.venues.map(({ venueName }) => venueName),
						)}
						onClick={() => navigate(`${location.pathname}/venues`)}
					/>
					<MenuItem
						label="Дата"
						value={formatSelectedDates(filters.date)}
						onClick={() => navigate(`${location.pathname}/date`)}
					/>
				</Space>
			</div>

			<Space fullWidth size="s" className={styles["button-group"]}>
				<Button size="s" view="primary" block onClick={apply}>
					Показать
				</Button>
				{totalFiltersCount > 0 && (
					<Button size="s" block onClick={reset}>
						Сбросить все
					</Button>
				)}
			</Space>
		</div>
	);
};
