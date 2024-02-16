import { useNavigate, useParams } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Skeleton } from "@alfalab/core-components/skeleton";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";

import { Thumb } from "@/components/thumb/Thumb";
import { formatDateTime } from "@/lib/utils/formatDate";

import styles from "./EventDetails.module.css";

type EventDetailsProps = {
	data?: {
		title: string;
		poster: string;
		address: string;
		date: Date;
	};
};

export const EventDetails: React.FC<EventDetailsProps> = ({ data }) => {
	const navigate = useNavigate();
	const params = useParams();

	const isLoading = !data;

	return (
		<div className={styles["container"]}>
			<Skeleton visible={isLoading}>
				<Thumb
					width={100}
					rounded="xl"
					src={data?.poster}
					style={{
						aspectRatio: "95 / 138",
					}}
				/>
			</Skeleton>

			<div className={styles["content"]}>
				<Space size={8}>
					<Skeleton visible={isLoading}>
						<Typography.TitleMobile tag="h2" view="xsmall" weight="bold">
							{data?.title || "Название события"}
						</Typography.TitleMobile>
					</Skeleton>

					<Skeleton visible={isLoading}>
						<Typography.Text
							view="primary-small"
							style={{
								display: "block",
							}}
						>
							{data
								? formatDateTime(data.date, {
										day: "numeric",
										weekday: "long",
										month: "long",
										hour: "2-digit",
										minute: "2-digit",
								  })
								: "Дата проведения"}
						</Typography.Text>
					</Skeleton>

					{data?.address && (
						<Typography.Text view="secondary-medium" color="secondary">
							{data.address}
						</Typography.Text>
					)}
				</Space>

				<Button
					size="xs"
					onClick={() => navigate(`/city/${params.cid}/${params.action}`)}
					style={{
						willChange: "initial",
					}}
				>
					Посмотреть описание
				</Button>
			</div>
		</div>
	);
};
