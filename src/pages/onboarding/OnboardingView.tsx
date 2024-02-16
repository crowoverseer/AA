import { useEffect, useState } from "react";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Skeleton } from "@alfalab/core-components/skeleton";

import { usePageSettings } from "@/lib/hooks";
// import { randomNumber } from "@/lib/utils/randomNumber";
import { API_ENDPOINT } from "@/lib/constants";

import image from "@/assets/images/onboarding.png";

import styles from "./Onboarding.module.css";

type OnboardingViewProps = {
	pageId: number;
};

export const OnboardingView: React.FC<OnboardingViewProps> = ({ pageId }) => {
	const [nextLink, setNextLink] = useState();
	const [isLoading, setLoading] = useState(true);

	usePageSettings({
		pageId,
	});

	const handleClickNext = () => {
		if (nextLink) {
			location.replace(nextLink);
		}
	};

	useEffect(() => {
		fetch(API_ENDPOINT, {
			method: "POST",
			body: JSON.stringify({
				id: 555, // Math.floor(randomNumber(1, 999)),
			}),
			// headers: {
			// 	"X-Auth-Token": "alfatoken",
			// },
		})
			.then((res) => res.json())
			.then(({ data }) => setNextLink(data.url))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className={styles["container"]}>
			<div>
				<Skeleton visible={isLoading}>
					<Typography.TitleMobile tag="h1" view="medium" weight="bold">
						Афиша
					</Typography.TitleMobile>
				</Skeleton>

				<div className={styles["content"]}>
					{isLoading ? (
						<Skeleton visible={true}>Description</Skeleton>
					) : (
						<div>
							<Typography.Text
								tag="p"
								defaultMargins={false}
								view="primary-medium"
							>
								Ходите на концерты, выставки, спектакли и яркие события города с
								кэшбэком 25%.
							</Typography.Text>

							<Typography.Text
								tag="p"
								view="primary-medium"
								color="secondary"
								className={styles["annotation"]}
							>
								Нажимая «За билетами», я даю согласие на переход в сервис
								партнёра банка.
							</Typography.Text>
						</div>
					)}
				</div>
			</div>

			<div>
				{!isLoading && (
					<div>
						<img
							width="100%"
							src={image}
							alt="onboarding"
							className={styles["image"]}
						/>
					</div>
				)}

				<Skeleton visible={isLoading}>
					<Button block view="primary" size="m" onClick={handleClickNext}>
						За билетами
					</Button>
				</Skeleton>
			</div>
		</div>
	);
};
