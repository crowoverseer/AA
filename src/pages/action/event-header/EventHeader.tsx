import { AgeLabel } from "@/components/age-label/AgeLabel";
import { Thumb } from "@/components/thumb/Thumb";
import { ActionExt } from "@/lib/types";

import styles from "./EventHeader.module.css";

type EventHeaderProps = {
	data?: ActionExt;
};

function getImageStyles(format: ActionExt["posterFormat"]) {
	switch (format) {
		case "1242x800": {
			return {
				aspectRatio: "621 / 400",
			};
		}
		case "1280x392": {
			return {
				aspectRatio: "2 / 1",
				objectPosition: "right",
			};
		}
		case "default": {
			return {
				width: "100%",
				height: "auto",
			};
		}
	}
}

export const EventHeader: React.FC<EventHeaderProps> = ({ data }) => {
	return (
		<div className={styles["container"]}>
			<Thumb
				src={data?.poster}
				alt={data?.actionName}
				style={data && getImageStyles(data.posterFormat)}
			/>

			{data?.age && <AgeLabel age={data.age} className={styles["age"]} />}
		</div>
	);
};
