import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroller";
import { Typography } from "@alfalab/core-components/typography";

import {
	NodesContextProvider,
	NodeItem,
	NodesContext,
} from "@/components/nodes/NodesContext";
import { useActions } from "@/lib/actions/ActionsContext";
import { useDebouncedCallback } from "@/lib/hooks";
import { Action, Venue } from "@/lib/types";

import { ActionItem } from "../action-item/ActionItem";

import styles from "./ActionList.module.css";

const ITEMS_PER_PAGE = 10;

export const ActionList: React.FC = () => {
	const [, setSearchParams] = useSearchParams();
	const data = useLoaderData() as { item: number };
	const { actions, city, totalFiltersCount } = useActions();
	const [page, setPage] = useState(() => {
		return Math.ceil(Number(data.item) / ITEMS_PER_PAGE) - 1;
	});
	const [items, setItems] = useState<Array<Action & { venues: Venue[] }>>([]);
	const [hasMore, setHasMore] = useState(true);
	const loadingRef = useRef(true);
	const nodesRef = useRef(new Map<string, HTMLDivElement>());

	const handleScroll = useDebouncedCallback(() => {
		const srollTop = window.scrollY;

		if (srollTop > 100) {
			const item = [...nodesRef.current].find(
				([_, elementRef]) => elementRef && elementRef.offsetTop >= srollTop,
			);

			if (item) {
				const [currentItemId] = item;
				setSearchParams({ item: String(currentItemId) }, { replace: true });
			}
		}
	}, 100);

	const loadFunc = useCallback(() => {
		const nextPage = page + 1;
		const nextItems = actions.slice(0, ITEMS_PER_PAGE * nextPage);

		setItems(nextItems);

		setHasMore(nextItems.length < actions.length);

		setPage(nextPage);
	}, [page, actions]);

	useEffect(() => {
		if (loadingRef.current === false) {
			setSearchParams({}, { replace: true });
		}

		loadFunc();
	}, [actions]);

	useEffect(() => {
		document.addEventListener("scroll", handleScroll);

		return () => {
			document.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const registerItem = useCallback<NodesContext["registerItem"]>(
		({ id, ref }) => {
			if (loadingRef.current === true && id === String(data.item)) {
				ref.scrollIntoView();
				loadingRef.current = false;
			}

			nodesRef.current.set(id, ref);
		},
		[],
	);

	const unregisterItem = useCallback<NodesContext["unregisterItem"]>((id) => {
		nodesRef.current.delete(id);
	}, []);

	return (
		<NodesContextProvider value={{ registerItem, unregisterItem }}>
			{actions.length === 0 ? (
				<Typography.Text className={styles["not-found-message"]}>
					Ничего ничего не найдено
				</Typography.Text>
			) : (
				<div>
					<div className={styles["header"]}>
						<Typography.TitleMobile
							tag="h2"
							view="small"
							weight="bold"
							className={styles["item-title"]}
						>
							{totalFiltersCount === 0
								? "Вам может понравиться"
								: "Результаты поиска"}
						</Typography.TitleMobile>
					</div>

					<InfiniteScroll
						pageStart={page}
						loadMore={loadFunc}
						hasMore={hasMore}
						threshold={300}
						loader={
							<Fragment key="loading">
								<ActionItem />
								<ActionItem />
							</Fragment>
						}
						className={styles["list"]}
					>
						{items.map((action, idx) => (
							<NodeItem key={action.actionId} id={String(idx + 1)}>
								<Link
									to={`/city/${city.cityId}/${action.venues[0].venueId}_${action.actionId}`}
								>
									<ActionItem
										data={{
											id: action.actionId,
											title: action.actionName,
											posterName: action.actionName,
											posterUrl: action.smallPosterKassir,
											venues: action.venues,
											cityId: city.cityId,
											age: action.age,
											kind: action.kindName,
											minPrice: action.minPrice,
											maxPrice: action.maxPrice,
											firstEventDate: new Date(action.from * 1000),
											lastEventDate: new Date(action.to * 1000),
											time: action.time,
											cashback: action.cashback,
										}}
									/>
								</Link>
							</NodeItem>
						))}
					</InfiniteScroll>
				</div>
			)}
		</NodesContextProvider>
	);
};
