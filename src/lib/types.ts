type APIResponseSuccess<TDecode> = {
	type: "success";
	decode: TDecode;
	error: false;
	message: false;
	advice: false;
	system: false;
	api_key: string;
	mode: number;
};

type APIResponseError = {
	type: "warning" | "message";
	decode: false;
	error: string;
	message: string;
	advice: string;
	system: string;
	api_key: false;
	mode: number;
};

export type APIResponse<TDecode> =
	| APIResponseSuccess<TDecode>
	| APIResponseError;

export type Country = {
	countryId: number;
	countryName: string;
	cities: Record<number, City>;
};

export type Kind = {
	kindId: number;
	kindName: string;
};

export type Genre = {
	genreId: number;
	genreName: string;
};

export type City = {
	cityId: number;
	cityName: string;
};

export type Venue = {
	venueId: number;
	venueName: string;
};

export type Action = {
	kindId: number;
	kindName: string;
	actionId: number;
	actionName: string;
	smallPosterKassir: string;
	storiesPosterKassir: string;
	advPosterKassir: string;
	duration: number;
	minPrice: number;
	maxPrice: number;
	from: number;
	to: number;
	time: string;
	age: string;
	menu: Array<{
		menuId: string;
		menuName: string;
	}>;
	fanIdRequired: null;
	kdp: boolean;
	venues: Record<
		number,
		{
			cityId: number;
			cityName: string;
			venueId: number;
			venueName: string;
			href: string;
		}
	>;
	genres: Array<Genre>;
	cashback: number;
};

export type ActionEvent = {
	actionEventId: number;
	categoryLimitList: Array<{
		categoryList: Array<{
			availability: number;
			categoryPriceId: number;
			categoryPriceName: string;
			price: number;
			tariffIdMap: Record<number, number>;
		}>;
		remainder?: number;
	}>;
	currency: string;
	day: string;
	eTicket: true;
	fanIdRequired: boolean;
	fullNameRequired: boolean;
	phoneRequired: boolean;
	placementUrl?: string;
	seatingPlanId: number;
	seatingPlanName: string;
	tariffPlanList: Array<{
		tariffPlanId: number;
		tariffPlanName: string;
	}>;
	time: string;
	maxPrice?: number;
	minPrice?: number;
	timestamp: number;
};

export type GetFiltersResult = Array<{
	countryId: number;
	countryName: string;
	cities: Array<{
		cityId: number;
		cityName: string;
	}>;
}>;

export type GetAllCitiesResult = Array<{
	countryId: number;
	countryName: string;
	cities: Array<{
		cityId: number;
		cityName: string;
		abbr: string;
		link: number;
		towns?: Array<{
			cityId: number;
			cityName: string;
			region: string;
		}>;
	}>;
}>;

export type GetAllActionsResult = Array<Country>;

export type SelectionEvent = {
	actionId: string;
	age: string;
	cityId: string;
	countryId: string;
	dates: string;
	eventId: string;
	id: number;
	name: string;
	popularity: number;
	poster: string;
	price: { min: number; max: number };
	max: number;
	min: number;
	type: string;
	venueId: string;
	cashback: number;
};

export type Selection = {
	id: number;
	name: string;
	short_name: string;
	events: Record<number, SelectionEvent>;
};

export type SliderItem = {
	actionId: string;
	age: string;
	button: string;
	cityId: string;
	countryId: string;
	dates: string;
	eventId: string;
	id: number;
	picture: string;
	place: string;
	price: { min: number };
	min: number;
	title: string;
	type: string;
	venueId: number;
	video: null;
	cashback: number;
};

export type GetAllActionsByCityResult = {
	countryId: number;
	countryName: string;
	cityId: number;
	cityName: string;
	where: string;
	cities: Array<{
		cityId: number;
		cityName: string;
	}>;
	venues: Array<{
		venueId: number;
		venueName: string;
	}>;
	kinds: Array<{
		kindId: number;
		kindName: string;
	}>;
	genres: Array<{
		genreId: number;
		genreName: string;
	}>;
	slider: Array<SliderItem>;
	selections: Array<Selection>;
	actions: Record<number, Action>;
	menu: Array<{
		menuId: string;
		menuName: string;
	}>;
};

export type ActionExt = {
	actionId: number;
	actionName: string;
	address: string;
	age: string;
	description?: string;
	from: number;
	fullActionName: string;
	geoLat: string;
	geoLon: string;
	kdp: boolean;
	poster: string;
	to: number;
	venueId: number;
	venueName: string;
	events: Record<number, ActionEvent>;
	minPrice?: number;
	maxPrice?: number;
	cashback: number;
	posterFormat: "default" | "1280x392" | "1242x800";
};

export type GetActionResult = ActionExt;

export type SetCityResult = "Ok" | false;

export type ReserveResult = {
	cartTimeout: number;
	currency: string;
	seatList: Array<{
		available: boolean;
		categoryPriceId: number;
		location: { sector: string; row: string; number: string };
		number: string;
		row: string;
		sector: string;
		new: boolean;
		placement: boolean;
		price: number;
		seatId: number;
	}>;
};

export type UnreserveResult = {
	cartTimeout: number;
	seatList: Array<{
		available: boolean;
		categoryPriceId: number;
		location: { sector: string; row: string; number: string };
		number: string;
		row: string;
		sector: string;
		new: boolean;
		placement: boolean;
		price: number;
		seatId: number;
	}>;
};

export type AuthResult = "OK" | false;

export type CartSeat = {
	categoryPriceId: number;
	categoryPriceName: string;
	discount: boolean;
	nominal: number;
	number: string;
	price: number;
	row: string;
	seatId: number;
	sector: string;
	tariffPlanId?: number;
	tariffPlanName?: "string";
};

export type CartEvent = {
	actionEventId: number;
	actionId: number;
	actionName: string;
	bigPosterUrl: string;
	cityId: number;
	cityName: string;
	day: string;
	fanIdRequired: boolean;
	fullActionName: string;
	fullNameRequired: boolean;
	kindId: number;
	phoneRequired: boolean;
	seatList: CartSeat[];
	seatingPlanId: number;
	seatingPlanName: string;
	serviceCharge: number;
	smallPosterUrl: string;
	time: string;
	venueId: number;
	venueName: string;
};

export type GetCartResult = {
	actionEventList: Array<CartEvent>;
	currency: string;
	time: number;
	totalServiceCharge: number;
	totalSum: number;
	cashback: number;
};

export type CreateOrderResult = {
	orderId: number;
	formUrl: string;
	statusExtStr: string;
	statusExtInt: OrderStatus;
};

export enum OrderStatus {
	NEW = 0,
	PROCESSING = 1,
	PAID = 2,
	CANCELLING = -1,
	CANCELLED = -2,
	REFUNDED = 3,
}

export type Order = {
	orderId: number;
	currency: string;
	date: string;
	discount: number;
	serviceCharge: number;
	sum: number;
	quantity: number;
	ticketList: Array<{
		ticketId: number;
		date: string;
		actionName: string;
		venueName: string;
		sector: string;
		row: string;
		number: string;
		categoryName: string;
		price: number;
		event: number;
	}>;
	statusExtStr:
		| "NEW"
		| "PROCESSING"
		| "PAID"
		| "CANCELLING"
		| "CANCELLED"
		| "REFUNDED";
	statusExtInt: OrderStatus;
	userMessage: string;
	created: number;
	formUrl: string;
};

export type GetOrdersResult = {
	orderList: Array<Order>;
};

export type Ticket = {
	ticketId: number;
	seatId: number;
	actionEventId: number;
	actionId: number;
	venueId: number;
	date: string;
	venueName: string;
	venueAddress: string;
	sector: string;
	row: string;
	number: string;
	categoryName: string;
	tariffPlanId: number;
	tariffPlanName: string;
	price: number;
	totalPrice: number;
	serviceCharge: number;
	barCodeImg: string;
	barCodeNumber: string;
	barCodeType: string;
	actionName: string;
	smallPosterUrl: string;
	legalOwner: string;
	legalOwnerName: string;
	legalOwnerInn: string;
	legalOwnerPhone: string;
	age: string;
	statusInt: number;
	statusStr: string;
};

export type GetTicketsByOrderResult = {
	actionEventDatePattern: string;
	created: number;
	currency: string;
	date: string;
	discount: number;
	orderDatePattern: string;
	orderId: number;
	quantity: number;
	serviceCharge: number;
	status: number;
	statusExtInt: number;
	statusExtStr: string;
	sum: number;
	ticketList: Array<Ticket>;
	totalSum: number;
	cashback: number;
	user: {
		email: string;
		name: string;
		phone: string;
	};
};

export type AlfaAuthResult = {
	cityId: number;
};

export type SuccessPayResult = {
	orderId: number;
	message: string;
};

export type FailPayResult = {
	orderId: number;
	message: string;
	advice: string;
};

export type RouteAction<TData> =
	| {
			data?: TData;
			error?: {
				code: string;
				message: string;
			};
	  }
	| undefined;
