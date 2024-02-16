import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { ExclamationMIcon } from "@alfalab/icons-glyph/ExclamationMIcon";

import styles from "./Error.module.css";

type CriticalErrorProps = {
	action: React.ReactNode;
};

export const CriticalError: React.FC<CriticalErrorProps> = ({ action }) => {
	return (
		<div className={styles["container"]}>
			<Space align="center" size="l" className={styles["content"]}>
				<SuperEllipse size={80}>
					<ExclamationMIcon color="black" />
				</SuperEllipse>

				<Space align="center" size={"s"}>
					<Typography.TitleMobile tag="h1" view="small" weight="medium">
						Что-то пошло не так
					</Typography.TitleMobile>

					<Typography.Text view="primary-small">
						Попробуйте войти в сервис ещё раз
					</Typography.Text>
				</Space>
			</Space>

			{action}
		</div>
	);
};
