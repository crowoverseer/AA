import { Venue } from "./types";
import { MAX_PLACES_HISTORY_ITEMS } from "./constants";

const PLACES_HISTORY_KEY = "places_history";

class PlacesHistory {
	#cache_key = location.host;

	addItems(items: Venue[]) {
		const existing = this.getItems();

		const filtered = items.filter(
			({ venueId }) => !existing.some((item) => item.venueId === venueId),
		);

		const itemsToStorage = [...existing, ...filtered].slice(
			-MAX_PLACES_HISTORY_ITEMS,
		);

		localStorage.setItem(
			`${this.#cache_key}_${PLACES_HISTORY_KEY}`,
			JSON.stringify(itemsToStorage),
		);
	}
	getItems() {
		return JSON.parse(
			localStorage.getItem(`${this.#cache_key}_${PLACES_HISTORY_KEY}`) || "[]",
		) as Array<Venue>;
	}
}

export const placesHistory = new PlacesHistory();
