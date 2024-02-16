import { Suspense } from "react";
import {
	Outlet,
	Await,
	createBrowserRouter,
	defer,
	LoaderFunction,
	RouterProvider,
	useAsyncError,
	useLoaderData,
	Navigate,
} from "react-router-dom";

import { MainLayout } from "@/components/layouts/main-layout/MainLayout";
import { PageLoader } from "@/components/page-loader/PageLoader";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { OnboardingView } from "@/pages/onboarding/OnboardingView";
import { AuthView, authLoader } from "@/pages/auth/AuthView";
import { CityView, cityViewLoader } from "@/pages/city/CityView";
import { WithCart } from "@/lib/cart/CartContext";
import { WithActions } from "@/lib/actions/ActionsContext";
import { WithCities } from "@/lib/city/CityContext";
import { WithTheme } from "@/lib/theme";
import { apiService } from "@/lib/api";
import { APIError } from "@/lib/error";
import { GetAllActionsByCityResult } from "@/lib/types";

const rootLoader = () => {
	const citiesPromise = apiService.getAllCities();

	return defer({
		cities: citiesPromise,
	});
};

const RootWrapper: React.FC = () => {
	const data = useLoaderData() as {
		cities: ReturnType<typeof apiService.getAllCities>;
	};

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.cities} errorElement={<CityWrapperError />}>
				{(countries) => (
					<WithCities cities={countries[0].cities}>
						<WithCart>
							<MainLayout />
						</WithCart>
					</WithCities>
				)}
			</Await>
		</Suspense>
	);
};

type ActionsData = {
	actions: Promise<GetAllActionsByCityResult>;
};

const CityWrapperError: React.FC = () => {
	const error = useAsyncError() as Error;

	if (error instanceof APIError && error.type === "message") {
		return Navigate({ to: "/city", replace: true });
	}

	throw error;
};

const CityWrapper = () => {
	const data = useLoaderData() as ActionsData;

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.actions} errorElement={<CityWrapperError />}>
				{(actions) => (
					<WithActions data={actions}>
						<Outlet />
					</WithActions>
				)}
			</Await>
		</Suspense>
	);
};

const cityLoader: LoaderFunction = ({ params }) => {
	const cityId = params.cid;
	const actionsPromise = apiService.getAllActionsByCity({
		cid: String(cityId),
	});

	return defer({
		actions: actionsPromise,
	});
};

const router = createBrowserRouter([
	{
		element: <RootWrapper />,
		errorElement: <ErrorBoundary />,
		loader: rootLoader,
		shouldRevalidate: () => false,
		children: [
			...(process.env.REACT_APP_MODE === "stage"
				? [
						{
							path: "/",
							element: <OnboardingView pageId={1} />,
						},
				  ]
				: []),
			// Auth callback page
			{
				path: "/alfa-auth/:guid",
				element: <AuthView />,
				loader: authLoader,
			},
			// Set city page
			{
				path: "/city",
				lazy: () => import("@/pages/cities/CitiesView"),
			},
			{
				element: <CityWrapper />,
				loader: cityLoader,
				shouldRevalidate: () => false,
				children: [
					// Action pages
					{
						path: "/city/:cid",
						element: <CityView pageId={1} />,
						loader: cityViewLoader,
						shouldRevalidate: ({ currentParams, nextParams }) => {
							return currentParams.cid !== nextParams.cid;
						},
					},
					// Filters
					{
						path: "/city/:cid/search",
						lazy: () => import("@/pages/search/SearchView"),
					},
					{
						path: "/city/:cid/filters",
						lazy: async () => {
							const { FiltersView } = await import("@/pages/filters");
							return { Component: FiltersView };
						},
					},
					{
						path: "/city/:cid/filters/city",
						lazy: async () => {
							const { FiltersCityView } = await import("@/pages/filters");
							return { Component: FiltersCityView };
						},
					},
					{
						path: "/city/:cid/filters/genres",
						lazy: async () => {
							const { FiltersGenresView } = await import("@/pages/filters");
							return { Component: FiltersGenresView };
						},
					},
					{
						path: "/city/:cid/filters/kind",
						lazy: async () => {
							const { FiltersKindView } = await import("@/pages/filters");
							return { Component: FiltersKindView };
						},
					},
					{
						path: "/city/:cid/filters/venues",
						lazy: async () => {
							const { FiltersVenuesView } = await import("@/pages/filters");
							return { Component: FiltersVenuesView };
						},
					},
					{
						path: "/city/:cid/filters/date",
						lazy: async () => {
							const { FiltersDateView } = await import("@/pages/filters");
							return { Component: FiltersDateView };
						},
					},
					{
						id: "action",
						lazy: async () => {
							const { loader } = await import("@/pages/action/ActionView");
							return { loader };
						},
						shouldRevalidate: () => true,
						children: [
							{
								path: "/city/:cid/:action",
								lazy: async () => {
									const { Component } = await import(
										"@/pages/action/ActionView"
									);
									return { Component };
								},
							},
							{
								path: "/city/:cid/:action/reservation/:eventId",
								lazy: () => import("@/pages/reservation/ReservationView"),
							},
						],
					},
				],
			},
			// Checkout page (create order)
			{
				path: "/checkout",
				lazy: () => import("@/pages/checkout/CheckoutView"),
				// errorElement: <CheckoutViewError />,
			},
			// Account page
			{
				path: "/account",
				lazy: () => import("@/pages/account/AccountView"),
			},
			{
				path: "/faq",
				lazy: () => import("@/pages/faq/FAQView"),
			},
			// {
			// 	path: "/settings/city",
			// 	element: <FiltersCityView pageId={4} withoutHistory />,
			// },
			// My orders page
			{
				path: "/orders",
				lazy: () => import("@/pages/orders/OrdersView"),
			},
			{
				id: "ticket",
				lazy: async () => {
					const { loader } = await import("@/pages/ticket/TicketView");
					return { loader };
				},
				children: [
					// Ticket page
					{
						path: "/orders/:oid",
						lazy: async () => {
							const { Component } = await import("@/pages/ticket/TicketView");
							return { Component };
						},
					},
					// Refound page
					{
						path: "/orders/:oid/refund",
						lazy: () => import("@/pages/refund/RefundView"),
					},
				],
			},
			// Success payment callback page
			{
				path: "/success/:oid/:api_key",
				lazy: () => import("@/pages/payment/SuccessPaymentView"),
			},
			// Failed payment callback page
			{
				path: "/fail/:oid/:api_key",
				lazy: () => import("@/pages/payment/FailedPaymentView"),
			},
			{
				path: "/refund-policy",
				lazy: () => import("@/pages/refund-policy/RefundPolicyView"),
			},
		],
	},
]);

export const App: React.FC = () => {
	return (
		<WithTheme>
			<RouterProvider router={router} />
		</WithTheme>
	);
};
