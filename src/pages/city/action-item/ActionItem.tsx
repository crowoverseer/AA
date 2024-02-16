import { useNavigate } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Skeleton } from "@alfalab/core-components/skeleton";
import { isSameDay, isSameYear } from "date-fns";

import styles from "./ActionItem.module.css";

import { CashbackAB } from "@/components/cashback/Cashback";
import { Thumb } from "@/components/thumb/Thumb";
import { formatString } from "@/lib/utils/formatString";
import { Venue } from "@/lib/types";

function getFormattedDate(args: {
	firstDate: Date;
	lastDate: Date;
	time?: string;
}): string {
	const formatterOptions: Intl.DateTimeFormatOptions = {
		month: "long",
		day: "numeric",
	};

	if (isSameDay(args.firstDate, args.lastDate)) {
		const date = args.firstDate;

		if (args.time) {
			const [hour, min] = args.time.split(":");
			date.setHours(Number(hour), Number(min));
			formatterOptions.hour = "2-digit";
			formatterOptions.minute = "2-digit";
		}

		const formatter = new Intl.DateTimeFormat("ru", formatterOptions);

		return formatter.format(args.firstDate);
	} else if (isSameYear(args.firstDate, args.lastDate)) {
		const formatter = new Intl.DateTimeFormat("ru", formatterOptions);

		return `${formatter.format(args.firstDate)} - ${formatter.format(
			args.lastDate,
		)}`;
	} else {
		const formatter = new Intl.DateTimeFormat("ru", {
			...formatterOptions,
			year: "2-digit",
		});

		return `${formatter.format(args.firstDate)} - ${formatter.format(
			args.lastDate,
		)}`.replaceAll(" г.", "");
	}
}

function getFormattedPrice(args: {
	minPrice: number;
	maxPrice: number;
}): string {
	const isRange = args.minPrice !== args.maxPrice;

	return isRange ? `От ${args.minPrice} ₽` : `${args.maxPrice} ₽`;
}

type ActionItemProps = {
	data?: {
		id: number;
		title: string;
		posterUrl: string;
		posterName: string;
		venues: Venue[];
		cityId: number;
		age: string;
		kind: string;
		minPrice: number;
		maxPrice: number;
		firstEventDate: Date;
		lastEventDate: Date;
		time: string;
		cashback: number;
	};
};

export const ActionItem: React.FC<ActionItemProps> = ({ data }) => {
	const navigate = useNavigate();

	const isLoading = data === undefined;

	return (
		<div className={styles["container"]}>
			<div>
				<div className={styles["image-container"]}>
					<Skeleton visible={isLoading}>
						<Thumb
							width={120}
							rounded="xl"
							src={data?.posterUrl}
							alt={data?.posterName || data?.title}
							style={{
								aspectRatio: "95 / 138",
							}}
						/>
					</Skeleton>
					{data && (
						<CashbackAB
							value={`${data.cashback}%`}
							className={styles["cashback"]}
						/>
					)}
				</div>
			</div>

			<div className={styles["right-side"]}>
				<div className={styles["content"]}>
					<Typography.TitleMobile
						view="xsmall"
						weight="bold"
						tag="h2"
						className={styles["title"]}
					>
						<Skeleton visible={isLoading}>
							{(data && formatString(data.title)) || "Заголовок"}
						</Skeleton>
					</Typography.TitleMobile>

					<Skeleton visible={isLoading} className={styles["date"]}>
						<Typography.Text view="primary-small">
							{data
								? getFormattedDate({
										firstDate: data.firstEventDate,
										lastDate: data.lastEventDate,
										time: data.time,
								  })
								: "Дата проведения"}
						</Typography.Text>
					</Skeleton>

					<Skeleton visible={isLoading} className={styles["location"]}>
						<Typography.Text view="secondary-medium" color="secondary">
							{(data &&
								formatString(
									data.venues.map(({ venueName }) => venueName).join(", "),
								)) ||
								"Место"}
						</Typography.Text>
					</Skeleton>
				</div>

				<div
					className={styles["bottom-content"]}
					style={{ visibility: isLoading ? "hidden" : "visible" }}
				>
					<Button
						size="xs"
						view="primary"
						onClick={() =>
							data &&
							navigate(
								`/city/${data.cityId}/${data.venues[0].venueId}_${data.id}`,
							)
						}
					>
						{data
							? getFormattedPrice({
									minPrice: data.minPrice,
									maxPrice: data.maxPrice,
							  })
							: "-"}
					</Button>
				</div>
			</div>
		</div>
	);
};
