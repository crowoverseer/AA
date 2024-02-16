import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
	Await,
	LoaderFunction,
	defer,
	useNavigate,
	useParams,
	useAsyncError,
	useRouteLoaderData,
} from "react-router-dom";
import cx from "classnames";
import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { Button } from "@alfalab/core-components/button";

import { PageLoader } from "@/components/page-loader/PageLoader";
import { InlineNonCriticalError } from "@/components/error/NonCriticalError";
import { PlaceCard } from "@/components/place-card/PlaceCard";
import { useActions } from "@/lib/actions/ActionsContext";
import { useToggle, usePageId, usePageTitle } from "@/lib/hooks";
import { apiService } from "@/lib/api";
import { formatString } from "@/lib/utils/formatString";
import { APIError } from "@/lib/error";
import { GetActionResult } from "@/lib/types";

import { EventHeader } from "./event-header/EventHeader";
import { TimeTable } from "./time-table/TimeTable";

import styles from "./ActionView.module.css";

type DescriptionProps = {
	children: React.ReactNode;
};

const Description: React.FC<DescriptionProps> = ({ children }) => {
	const [isOpen, toggleOpen] = useToggle(false);
	const [isEnabled, setEnabled] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (containerRef.current?.clientHeight) {
			setEnabled(containerRef.current.clientHeight > 120);
		}
	}, []);

	return (
		<div>
			<div
				className={cx(
					styles["disclosure"],
					!isOpen && isEnabled && styles["disclosure-close"],
				)}
				style={
					isEnabled
						? {
								height: isOpen
									? `${containerRef.current?.clientHeight || 0}px`
									: "140px",
						  }
						: {}
				}
			>
				<Space direction="vertical" size="m" ref={containerRef}>
					{children}
				</Space>
			</div>

			{isEnabled && (
				<button type="button" onClick={() => toggleOpen()}>
					<Typography.Text view="secondary-medium" color="link">
						{isOpen ? "Скрыть" : "Развернуть"}
					</Typography.Text>
				</button>
			)}
		</div>
	);
};

type ActionData = {
	action: Promise<GetActionResult>;
};

type ActionProps = {
	data?: GetActionResult;
};

const Action: React.FC<ActionProps> = ({ data }) => {
	const navigate = useNavigate();
	const { city, actions } = useActions();

	usePageTitle(data?.actionName || "Событие");

	const isOneTimeEvent = Object.values(data?.events || {}).length === 1;
	const actionVenues = useMemo(() => {
		const cityAction = Object.values(actions).find(
			({ actionId }) => actionId === data?.actionId,
		);

		return Object.values(cityAction?.venues || {}).filter(
			({ cityId }) => cityId === city.cityId,
		);
	}, [actions, data, city]);

	return (
		<div>
			<EventHeader data={data} />

			<div className={styles["container"]}>
				{data && (
					<div>
						<Space size="l" fullWidth>
							<Space size="l" fullWidth>
								<Space size={8}>
									<Typography.TitleMobile
										view="small"
										tag="h2"
										weight="bold"
										className={styles["subtitle"]}
									>
										{data && formatString(data.actionName)}
									</Typography.TitleMobile>

									{data.fullActionName && (
										<Typography.Text
											view="secondary-large"
											color="secondary"
											className={styles["title"]}
										>
											{data && formatString(data.fullActionName)}
										</Typography.Text>
									)}
								</Space>

								<TimeTable data={{ ...data, actionVenues }} />

								{!!data.description && (
									<div>
										<Typography.TitleMobile
											view="xsmall"
											tag="h3"
											weight="bold"
										>
											Описание
										</Typography.TitleMobile>
										<Description>
											<div
												// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
												dangerouslySetInnerHTML={{ __html: data.description }}
											/>
										</Description>
									</div>
								)}
							</Space>

							<PlaceCard data={data} />
						</Space>

						{isOneTimeEvent && (
							<Button
								view="primary"
								block
								onClick={() => {
									const eventId = Object.values(data.events)[0].actionEventId;

									navigate(`${location.pathname}/reservation/${eventId}`);
								}}
								className={styles["action-button"]}
							>
								Купить билет
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

const ActionError: React.FC = () => {
	const params = useParams();
	const navigate = useNavigate();
	const error = useAsyncError() as Error;

	if (error instanceof APIError && error.type === "message") {
		return (
			<InlineNonCriticalError
				title={error.message}
				message={error.advice}
				action={
					<Button
						size="s"
						view="primary"
						onClick={() => {
							const nextLink = params.action ? `/city/${params.cid}` : "/city";

							navigate(nextLink);
						}}
					>
						Продолжить
					</Button>
				}
			/>
		);
	}

	throw error;
};

export const Component: React.FC = () => {
	const data = useRouteLoaderData("action") as ActionData;

	usePageId(2);

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.action} errorElement={<ActionError />}>
				{(action: GetActionResult) => <Action data={action} />}
			</Await>
		</Suspense>
	);
};

export const loader: LoaderFunction = ({ params }) => {
	const cityId = params.cid as string;
	const actionParam = params.action as string;
	const [venueId, actionId] = actionParam.split("_");

	const actionPromise = apiService.getAction({ actionId, cityId, venueId });

	return defer({
		action: actionPromise,
	});
};
