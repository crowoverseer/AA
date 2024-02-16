import ScrollContainer from "react-indiana-drag-scroll";
import { Typography } from "@alfalab/core-components/typography";
import { Space } from "@alfalab/core-components/space";
import cx from "classnames";

import styles from "./Selector.module.css";

type SelectorItem = {
	id: string;
	label: string;
};

type SelectorProps = {
	title: string;
	items: SelectorItem[];
	selectedItem: SelectorItem | null;
	onSelect(item: SelectorItem): void;
};

export const Selector: React.FC<SelectorProps> = ({
	title,
	items,
	selectedItem,
	onSelect,
}) => {
	return (
		<div>
			<div className={styles["header"]}>
				<Typography.Text view="primary-small" weight="medium">
					{title}
				</Typography.Text>
			</div>

			<ScrollContainer className={styles["container"]}>
				<Space direction="horizontal" size="s" align="end">
					{items.map((item, idx) => (
						<div key={String(idx)}>
							<button
								type="button"
								className={cx(
									styles["item"],
									item.id === selectedItem?.id && styles["item-active"],
								)}
								onClick={() => onSelect(item)}
							>
								<Typography.Text view="primary-small" weight="bold">
									{item.label}
								</Typography.Text>
							</button>
						</div>
					))}
				</Space>
			</ScrollContainer>
		</div>
	);
};
