import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";

import { Thumb } from "@/components/thumb/Thumb";
import { Cashback } from "@/components/cashback/Cashback";

import styles from "./EventHeader.module.css";

type EventHeaderProps = {
	data?: {
		actionName: string;
		poster: string;
		date: Date;
		cashback: number;
	};
};

export const EventHeader: React.FC<EventHeaderProps> = ({ data }) => {
	return (
		<div className={styles["container"]}>
			<Thumb
				src={data?.poster}
				alt={data?.actionName}
				style={{ aspectRatio: "64 / 67" }}
			/>

			<Space className={styles["content"]}>
				<Cashback value={`${data?.cashback}%`} />

				{/* <Typography.TitleMobile
					view="small"
					tag="h2"
					weight="bold"
					color="static-primary-light"
					className={styles["subtitle"]}
				>
					{data?.fullActionName}
				</Typography.TitleMobile> */}

				<Typography.TitleMobile
					tag="h1"
					view="small"
					weight="bold"
					color="static-primary-light"
				>
					{data?.actionName}
				</Typography.TitleMobile>
			</Space>

			{/* {data?.age && <AgeLabel age={data.age} className={styles["age"]} />} */}
		</div>
	);
};
