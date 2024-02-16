import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { Space } from "@alfalab/core-components/space";
import InformationCircleMIcon from "@alfalab/icons-glyph/InformationCircleMIcon";

import styles from "./Error.module.css";

type NonCriticalErrorProps = {
	open: boolean;
	message?: string | null;
	advice?: string | null;
	onClose(): void;
	action: {
		label: string;
		callback(): void;
	};
};

export const NonCriticalError: React.FC<NonCriticalErrorProps> = ({
	open,
	message = null,
	advice = null,
	onClose,
	action,
}) => {
	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			actionButton={
				<Button block size="s" view="primary" onClick={action.callback}>
					{action.label}
				</Button>
			}
			stickyHeader
			usePortal
		>
			<div className={styles["message"]}>
				<Typography.Text view="primary-medium" color="secondary">
					{message || "Произошла ошибка"}
				</Typography.Text>
				{advice && (
					<Typography.Text view="primary-medium" color="secondary">
						{advice}
					</Typography.Text>
				)}
			</div>
		</BottomSheet>
	);
};

type InlineNonCriticalErrorProps = {
	title?: string;
	message?: string;
	action: React.ReactNode;
};

export const InlineNonCriticalError: React.FC<InlineNonCriticalErrorProps> = ({
	title,
	message,
	action,
}) => {
	return (
		<div className={styles["container"]}>
			<Space align="center" size="l" className={styles["content"]}>
				<SuperEllipse size={80}>
					<InformationCircleMIcon color="black" />
				</SuperEllipse>

				<Space align="center" size={"s"}>
					<Typography.TitleMobile tag="h1" view="small" weight="medium">
						{title}
					</Typography.TitleMobile>

					<Typography.Text view="primary-small">{message}</Typography.Text>
				</Space>
			</Space>

			{action}
		</div>
	);
};
