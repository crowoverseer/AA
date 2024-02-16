import { City } from "./types";
import { MAX_CITIES_HISTORY_ITEMS } from "./constants";

const CITIES_HISTORY_KEY = "cities_history";

class CitiesHistory {
	#cache_key = location.host;

	setItem(item: City) {
		const existing = this.getItems();

		if (!existing.find((city) => city.cityId === item.cityId)) {
			const itemsToStorage = [...existing, item].slice(
				-MAX_CITIES_HISTORY_ITEMS,
			);

			localStorage.setItem(
				`${this.#cache_key}_${CITIES_HISTORY_KEY}`,
				JSON.stringify(itemsToStorage),
			);
		}
	}
	getItems() {
		return JSON.parse(
			localStorage.getItem(`${this.#cache_key}_${CITIES_HISTORY_KEY}`) || "[]",
		) as Array<City>;
	}
}

export const citiesHistory = new CitiesHistory();
