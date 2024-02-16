import { Link } from "react-router-dom";
import ScrollContainer from "react-indiana-drag-scroll";
import { Typography } from "@alfalab/core-components/typography";

import { Thumb } from "@/components/thumb/Thumb";
import { CashbackAB } from "@/components/cashback/Cashback";
import { formatString } from "@/lib/utils/formatString";
import { Selection } from "@/lib/types";

import styles from "./Stories.module.css";

type StoriesProps = {
	data: Selection;
};

export const Stories: React.FC<StoriesProps> = ({ data }) => {
	return (
		<div>
			<div className={styles["header"]}>
				<Typography.TitleMobile
					tag="h2"
					view="small"
					weight="bold"
					className={styles["item-title"]}
				>
					{data.name}
				</Typography.TitleMobile>
			</div>

			<ScrollContainer>
				<div className={styles["container"]}>
					{Object.values(data.events).map(
						(
							{
								cityId,
								actionId,
								venueId,
								eventId,
								poster,
								name,
								dates,
								cashback,
							},
							idx,
						) => (
							<Link
								to={
									eventId
										? `/city/${cityId}/${venueId}_${actionId}/reservation/${eventId}`
										: `/city/${cityId}/${venueId}_${actionId}`
								}
								key={`${actionId}-${idx}`}
								className={styles["item"]}
							>
								<div className={styles["thumb-container"]}>
									<Thumb
										width={165}
										rounded="m"
										src={poster}
										alt={name}
										className={styles["item-image"]}
										style={{
											aspectRatio: "95 / 138",
										}}
									/>
									<CashbackAB
										value={`${cashback}%`}
										className={styles["cashback"]}
									/>
								</div>

								<Typography.Text weight="bold">
									{formatString(name)}
								</Typography.Text>

								<Typography.Text view="primary-small">{dates}</Typography.Text>
							</Link>
						),
					)}
				</div>
			</ScrollContainer>
		</div>
	);
};
