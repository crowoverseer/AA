import { useState, useMemo, useCallback } from "react";
import { endOfDay, startOfDay } from "date-fns";

import { createContext } from "@/lib/utils/context";
import {
	City,
	Venue,
	Kind,
	Action,
	GetAllActionsByCityResult,
} from "@/lib/types";

import { formatString } from "../utils/formatString";

type FiltersState = {
	kind: Kind | null;
	venues: Venue[];
	genres: Record<number, boolean>;
	date: [Date, Date] | [Date] | null;
	search: string;
	popular: boolean;
	weekend: boolean;
	month: boolean;
	menu: string | null;
};

type ActionsContext = {
	city: City & { where: string };
	kinds: Array<GetAllActionsByCityResult["kinds"][number]>;
	genres: Array<GetAllActionsByCityResult["genres"][number]>;
	venues: Array<GetAllActionsByCityResult["venues"][number]>;
	menus: Array<GetAllActionsByCityResult["menu"][number]>;
	actions: Array<
		Omit<Action, "venues"> & {
			venues: Array<{
				cityId: number;
				cityName: string;
				venueId: number;
				venueName: string;
				href: string;
			}>;
		}
	>;
	slider: Array<GetAllActionsByCityResult["slider"][number]>;
	selections: Array<GetAllActionsByCityResult["selections"][number]>;
	cities: Array<GetAllActionsByCityResult["cities"][number]>;
	filters: FiltersState;
	setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
	totalFiltersCount: number;
	totalResultsCount: number;
	resetFilters(): void;
};

const [useActions, ActionsProvider] = createContext<ActionsContext>("Actions");

const initialFiltersState: FiltersState = {
	kind: null,
	venues: [],
	genres: {},
	date: null,
	search: "",
	popular: false,
	month: false,
	weekend: false,
	menu: null,
};

type WithActionsProps = {
	data: GetAllActionsByCityResult;
	children: React.ReactNode;
};

const WithActions: React.FC<WithActionsProps> = ({ data, children }) => {
	const [filters, setFilters] = useState<FiltersState>(initialFiltersState);

	const city = useMemo<City & { where: string }>(() => {
		return {
			cityId: data.cityId,
			cityName: data.cityName,
			where: data.where,
		};
	}, [data]);

	const filteredActions = useMemo(() => {
		return Object.values(data.actions)
			.filter((action) => {
				// venues filter
				if (
					filters.venues.length > 0 &&
					!filters.venues.some(({ venueId }) => {
						return Object.values(action.venues)
							.map(({ venueId }) => venueId)
							.includes(venueId);
					})
				) {
					return false;
				}

				// menu filter
				if (
					filters.menu &&
					!action.menu.map(({ menuId }) => menuId).includes(filters.menu)
				) {
					return false;
				}

				// kind filter
				if (filters.kind && action.kindId !== filters.kind.kindId) {
					return false;
				}

				// genres filter
				const genresIds = Object.keys(filters.genres);

				if (
					genresIds.length > 0 &&
					!Object.keys(action.genres).some((id) => {
						return genresIds.includes(id);
					})
				) {
					return false;
				}

				// date filter
				if (filters.date) {
					const [dateFrom, dateTo] = filters.date;

					if (dateFrom && dateTo) {
						return (
							action.from * 1000 >= startOfDay(dateFrom).getTime() &&
							action.from * 1000 <= endOfDay(dateTo).getTime()
						);
					} else {
						return action.from * 1000 >= startOfDay(dateFrom).getTime();
					}
				}

				return true;
			})
			.map((action) => ({
				...action,
				venues: Object.values(action.venues).filter(
					({ cityId }) => cityId === data.cityId,
				),
			}));
	}, [data, filters]);

	const totalFiltersCount = useMemo(() => {
		return (
			(filters.kind ? 1 : 0) +
			(filters.date ? 1 : 0) +
			(filters.popular ? 1 : 0) +
			(filters.weekend ? 1 : 0) +
			(filters.month ? 1 : 0) +
			filters.venues.length +
			Object.values(filters.genres).filter((isChecked) => isChecked).length
		);
	}, [filters]);

	const resetFilters = useCallback(() => {
		setFilters(initialFiltersState);
	}, []);

	const ctxValue = useMemo<ActionsContext>(
		() => ({
			city,
			cities: data.cities,
			kinds: data.kinds,
			genres: data.genres,
			venues: data.venues.map(({ venueName, ...venue }) => ({
				...venue,
				venueName: formatString(venueName),
			})),
			slider: data.slider,
			menus: data.menu,
			selections: data.selections,
			filters,
			setFilters,
			resetFilters,
			totalFiltersCount,
			totalResultsCount: filteredActions.length,
			actions: filteredActions,
		}),
		[
			city,
			filteredActions,
			filters,
			setFilters,
			resetFilters,
			totalFiltersCount,
			data,
		],
	);

	return <ActionsProvider value={ctxValue}>{children}</ActionsProvider>;
};

export { useActions, WithActions };
