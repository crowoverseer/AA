import { openDB, IDBPDatabase } from "idb";

import { API_ENDPOINT } from "./constants";
import {
	GetAllCitiesResult,
	GetAllActionsResult,
	APIResponse,
	GetOrdersResult,
	CreateOrderResult,
	GetCartResult,
	AuthResult,
	UnreserveResult,
	ReserveResult,
	GetActionResult,
	SetCityResult,
	GetTicketsByOrderResult,
	GetAllActionsByCityResult,
	AlfaAuthResult,
	GetFiltersResult,
	SuccessPayResult,
	FailPayResult,
} from "./types";
import { APIError } from "./error";

const MINUTE = 1000 * 60;
const CACHE_TTL = MINUTE * 5;

const dbPromise = openDB("db", 1, {
	upgrade(db) {
		db.createObjectStore("requests", {
			keyPath: "path",
		});
	},
});

class APIService {
	#api_key: string | null = localStorage.getItem("api_key") || null;
	#cache_key: string;

	constructor() {
		const searchParams = new URLSearchParams(location.search);

		this.#cache_key = "default";

		const api_key = searchParams.get("api_key");

		if (api_key) {
			this.#api_key = api_key;
			localStorage.setItem("api_key", api_key);
		}
	}

	async getFilters() {
		return this.#fetch<GetFiltersResult>(
			"/get_filters",
			{
				method: "GET",
			},
			{ persist: true },
		);
	}

	async getAllCities() {
		return this.#fetch<GetAllCitiesResult>("/get_all_cities", {
			method: "GET",
		});
	}

	async getAllActions() {
		return this.#fetch<GetAllActionsResult>(
			"/get_all_actions",
			{
				method: "GET",
			},
			{ persist: true },
		);
	}

	async getAllActionsByCity(args: { cid: number | string }) {
		return this.#fetch<GetAllActionsByCityResult>(
			`/get_all_actions_by_city?cid=${args.cid}`,
			{},
			{ persist: true },
		);
	}

	async getAction(args: { actionId: string; venueId: string; cityId: string }) {
		return this.#fetch<GetActionResult>(
			`/get_action_ext?aid=${args.actionId}&vid=${args.venueId}&cid=${args.cityId}`,
			{
				method: "GET",
			},
		);
	}

	async setCity(args: { cityId: string | number }) {
		if (!this.#api_key) {
			return null;
		}

		const result = await this.#fetch<SetCityResult>("/set_city", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, cid: args.cityId }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async getSchema(args: { eid: string | number }) {
		const result = await this.#fetch<string>("/get_schema", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, eid: args.eid }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async reserve(args: {
		eid: number;
		categories?: Array<{ cid: number; tid?: number; qty: number }>;
		seats?: Array<{ sid: number; tid?: number }>;
	}) {
		const result = await this.#fetch<ReserveResult>("/reserve", {
			method: "POST",
			body: JSON.stringify({
				eid: args.eid,
				api_key: this.#api_key,
				categories: args.categories,
				seats: args.seats,
			}),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async unreserve(args: { seats: Array<{ sid: number }> }) {
		const result = await this.#fetch<UnreserveResult>("/unreserve", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, seats: args.seats }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async unreserveAll(args?: { eid?: string }) {
		const result = await this.#fetch<UnreserveResult>("/unreserve_all", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, eid: args?.eid }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async auth(args: { email: string }) {
		const result = await this.#fetch<AuthResult>("/auth", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, email: args.email }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async getCart() {
		const result = await this.#fetch<GetCartResult>("/get_cart", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async createOrder(args: {
		sum: string;
		currency: string;
		phone?: string;
		name?: string;
	}) {
		const result = await this.#fetch<CreateOrderResult>("/create_order", {
			method: "POST",
			body: JSON.stringify({
				api_key: this.#api_key,
				phone: args.phone,
				name: args.name,
				sum: args.sum,
				currency: args.currency,
			}),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async getOrders() {
		const result = await this.#fetch<GetOrdersResult>("/get_orders_ext", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key }),
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		return result;
	}

	async getTicketsByOrder(args: { oid: number | string }) {
		const result = await this.#fetch<GetTicketsByOrderResult>(
			"/get_tickets_by_order",
			{
				method: "POST",
				body: JSON.stringify({ api_key: this.#api_key, oid: args.oid }),
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			},
		);

		return result;
	}

	async alfaAuth(args: { guid: string }) {
		const result = await this.#fetch<AlfaAuthResult>("/alfa_auth", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, guid: args.guid }),
		});

		return result;
	}

	async successPay(args: { oid: number; bid: string; token: string }) {
		this.#setToken(args.token);

		const result = await this.#fetch<SuccessPayResult>("/success_pay", {
			method: "POST",
			body: JSON.stringify({
				api_key: args.token,
				oid: args.oid,
				bid: args.bid,
			}),
		});

		return result;
	}

	async failPay(args: { oid: number; bid?: string; token: string }) {
		this.#setToken(args.token);

		const result = await this.#fetch<FailPayResult>("/fail_pay", {
			method: "POST",
			body: JSON.stringify({
				api_key: args.token,
				oid: String(args.oid),
				bid: args.bid,
			}),
		});

		return result;
	}

	async deleteOrder(args: { oid: number }) {
		const result = await this.#fetch<string>("/delete_order", {
			method: "POST",
			body: JSON.stringify({ api_key: this.#api_key, oid: args.oid }),
		});

		return result;
	}

	refund(args: {
		oid: string;
		name?: string;
		email?: string;
		phone?: string;
		reason?: string;
	}) {
		return this.#fetch<"Ok">("/refund_order", {
			method: "POST",
			body: JSON.stringify({
				api_key: this.#api_key,
				oid: args.oid,
				name: args.name,
				email: args.email,
				phone: args.phone,
				reason: args.reason,
			}),
		});
	}

	async #fetch<T>(
		path: string,
		init?: RequestInit,
		options?: Partial<{ persist: boolean }>,
	): Promise<T> {
		const url = `${API_ENDPOINT}/json${path}`;

		let db: IDBPDatabase | null = null;

		if (options?.persist) {
			try {
				db = await dbPromise;
			} catch (err) {}

			if (db) {
				const cacheUrl = `${this.#cache_key}_${url}`;
				const cacheHit = await db.get("requests", cacheUrl);

				if (cacheHit) {
					const { data, t } = cacheHit as {
						data: string;
						t: number;
					};

					const now = new Date();

					if (now.getTime() < t + CACHE_TTL) {
						return Promise.resolve(JSON.parse(data));
					} else {
						await db.delete("requests", cacheUrl);
					}
				}
			}
		}

		return fetch(url, init)
			.then((res) => res.json() as Promise<APIResponse<T>>)
			.then((data) => {
				if (data.mode) {
					this.#cache_key = String(data.mode);
				}

				// Update API key
				if (data.api_key) {
					this.#setToken(data.api_key);
				}

				if (data.type !== "success") {
					throw new APIError({
						type: data.type,
						code: data.error || "unknown_error",
						message: data.message || "Произошла ошибка",
						advice: data.advice,
						system: data.system,
					});
				}

				// Save request to cache
				if (db) {
					const cacheUrl = `${this.#cache_key}_${url}`;

					db.put("requests", {
						path: cacheUrl,
						data: JSON.stringify(data.decode),
						t: new Date().getTime(),
					});
				}

				return data.decode;
			});
	}

	#setToken(token: string) {
		this.#api_key = token;
		localStorage.setItem("api_key", token);
	}
}

export const apiService = new APIService();
