import { useCallback, useMemo, useState } from "react";

import { createContext } from "@/lib/utils/context";

export enum CartItemType {
	Category = "Category",
	Seat = "Seat",
}

export type CartItem = {
	key: string;
	type: CartItemType;
	time: number;
	name: string;
	subHeading?: string;
	price: number;
	id: number;
	eventId: number;
	tariffName?: string;
	tariffId?: number;
	qty: number;
	limitId?: string;
	action: {
		name: string;
		poster: string;
		address: string;
		date: Date;
	};
};

export type ItemPayload = CartItem & {
	action: {
		name: string;
		poster: string;
		address: string;
		date: Date;
	};
};

export enum AuthStatus {
	IDLE = "IDLE",
	AUTH = "AUTH",
	NOT_AUTH = "NOT_AUTH",
}

export type CartContext = {
	authStatus: AuthStatus;
	limits: Record<string, number>;
	items: Record<string, CartItem>;
	totalCount: number;
	totalSum: number;
	setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
	addItems(items: Array<Omit<ItemPayload, "time">>): void;
	removeItems(itemKeys?: string[]): void;
	increaseItem(item: Omit<ItemPayload, "qty" | "time">): void;
	decreaseItem(key: string): void;
};

const [useCart, CartProvider] = createContext<CartContext>("Cart");

type WithCartProps = {
	children: React.ReactNode;
};

export const WithCart: React.FC<WithCartProps> = ({ children }) => {
	const [authStatus, setAuthStatus] = useState<CartContext["authStatus"]>(
		AuthStatus.IDLE,
	);
	const [items, setItems] = useState<Record<string, CartItem>>({});

	const increaseItem = useCallback<CartContext["increaseItem"]>((item) => {
		setItems((state) => {
			const existing = state[item.key];

			return {
				...state,
				[item.key]: {
					...item,
					time: new Date().getTime(),
					qty: existing ? existing.qty + 1 : 1,
				},
			};
		});
	}, []);

	const decreaseItem = useCallback<CartContext["decreaseItem"]>((key) => {
		setItems((state) => {
			const existing = state[key];

			if (existing) {
				if (existing.qty === 1) {
					const newState = { ...state };

					delete newState[key];

					return newState;
				} else {
					return {
						...state,
						[key]: {
							...existing,
							qty: existing.qty - 1,
						},
					};
				}
			}

			return state;
		});
	}, []);

	const addItems = useCallback<CartContext["addItems"]>((items) => {
		for (const item of items) {
			setItems((state) => {
				const newState = { ...state };

				if (item.qty === 0) {
					delete newState[item.key];

					return newState;
				} else {
					newState[item.key] = {
						...item,
						time: new Date().getTime(),
					};

					return newState;
				}
			});
		}
	}, []);

	const removeItems = useCallback<CartContext["removeItems"]>((itemKeys) => {
		setItems((state) => {
			if (itemKeys) {
				return Object.fromEntries(
					Object.entries(state).filter(([key]) => !itemKeys.includes(key)),
				);
			}

			return {};
		});
	}, []);

	const limits = useMemo(() => {
		return Object.values(items).reduce(
			(acc, item) =>
				item.limitId
					? {
							...acc,
							[item.limitId]: acc[item.limitId]
								? acc[item.limitId] + item.qty
								: item.qty,
					  }
					: acc,
			{} as CartContext["limits"],
		);
	}, [items]);

	const totalCount = useMemo(() => {
		return Object.values(items).reduce((acc, item) => acc + item.qty, 0);
	}, [items]);

	const totalSum = useMemo(() => {
		return Object.values(items).reduce(
			(acc, item) => acc + item.price * item.qty,
			0,
		);
	}, [items]);

	const ctxValue = useMemo<CartContext>(
		() => ({
			authStatus,
			items,
			limits,
			totalCount,
			totalSum,
			setAuthStatus,
			addItems,
			removeItems,
			increaseItem,
			decreaseItem,
		}),
		[
			authStatus,
			items,
			limits,
			totalCount,
			totalSum,
			setAuthStatus,
			addItems,
			removeItems,
			increaseItem,
			decreaseItem,
		],
	);

	return <CartProvider value={ctxValue}>{children}</CartProvider>;
};

export { useCart };
