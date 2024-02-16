import { useEffect, useRef } from "react";
import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { YMaps, Map as YMap, Placemark } from "@pbe/react-yandex-maps";
import ymaps from "yandex-maps";

import { formatString } from "@/lib/utils/formatString";
import { ActionExt } from "@/lib/types";

import styles from "./PlaceCard.module.css";

type PlaceCardProps = {
	data: ActionExt;
};

export const PlaceCard: React.FC<PlaceCardProps> = ({ data }) => {
	const mapRef = useRef<ymaps.Map>();

	useEffect(() => {
		mapRef.current?.panTo([Number(data.geoLat), Number(data.geoLon)], {
			flying: false,
		});
	}, [data]);

	return (
		<Space fullWidth>
			<Typography.TitleMobile view="xsmall" tag="h3" weight="bold">
				Место проведения
			</Typography.TitleMobile>

			<YMaps>
				<div className={styles["map"]}>
					<YMap
						width="100%"
						defaultState={{
							center: [Number(data.geoLat), Number(data.geoLon)],
							zoom: 15,
						}}
						instanceRef={mapRef}
					>
						<Placemark geometry={[Number(data.geoLat), Number(data.geoLon)]} />
					</YMap>
				</div>
			</YMaps>

			<Space size={4}>
				<Typography.Text view="secondary-large" className={styles["name"]}>
					{formatString(data.venueName)}
				</Typography.Text>

				<Typography.Text
					view="secondary-medium"
					color="secondary"
					className={styles["address"]}
				>
					{data.address}
				</Typography.Text>
			</Space>
		</Space>
	);
};
