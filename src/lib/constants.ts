export const MAX_CITIES_HISTORY_ITEMS = 5;
export const MAX_PLACES_HISTORY_ITEMS = 5;
export const MAX_SEARCH_RESULTS = 5;
export const MAX_POPULAR_PLACES = 15;
export const API_ENDPOINT =
	process.env.REACT_APP_MODE === "stage"
		? "https://api.alfatest.kassirdev.ru"
		: "https://api-alfa.kassir.ru";
// export const API_ENDPOINT = "https://api.q-transport.ru";
// export const API_ENDPOINT = "https://api-alfa.kassir.ru";
// export const API_ENDPOINT = "https://api.ufa.q-transport.ru";
