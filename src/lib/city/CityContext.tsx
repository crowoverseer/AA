import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { apiService } from "@/lib/api";
import { citiesHistory } from "@/lib/citiesHistory";
import { createContext } from "@/lib/utils/context";
import { GetAllCitiesResult } from "@/lib/types";

type CitiesContext = {
	cities: Array<
		GetAllCitiesResult[number]["cities"][number] & { keys: string[] }
	>;
	cityId: number;
	selectCity: (city: { cityId: number; cityName: string }) => void;
};

const [useCities, CitiesContextProvider] = createContext<CitiesContext>("City");

type WithCitiesProps = {
	cities: CitiesContext["cities"];
	children: React.ReactNode;
};

export const WithCities: React.FC<WithCitiesProps> = ({ cities, children }) => {
	const { cid } = useParams();
	const [cityId, setCityId] = useState<number>(Number(cid));

	const selectCity: CitiesContext["selectCity"] = (city) => {
		citiesHistory.setItem(city);
		setCityId(city.cityId);
		localStorage.setItem("city", String(city.cityId));

		apiService.setCity({ cityId: city.cityId }).then(() => {
			localStorage.setItem("city", String(city.cityId));
			location.href = `/city/${city.cityId}`;
		});
	};

	return (
		<CitiesContextProvider
			value={{
				cities: useMemo(
					() =>
						cities.map((city) => ({
							...city,
							keys: [
								city.cityName,
								...(city.towns
									? city.towns.map(({ cityName }) => cityName)
									: []),
							],
						})),
					[cities],
				),
				cityId,
				selectCity,
			}}
		>
			{children}
		</CitiesContextProvider>
	);
};

export { useCities, CitiesContextProvider };
