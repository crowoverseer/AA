import ScrollContainer from "react-indiana-drag-scroll";
import { Tag } from "@alfalab/core-components/tag";

import styles from "./TagList.module.css";

type TagListProps = {
	tags: {
		label: string;
		key: string;
	}[];
	selectedTags: Record<string, boolean>;
	onChange(tags: Record<string, boolean>): void;
};

export const TagList: React.FC<TagListProps> = ({
	tags,
	selectedTags,
	onChange,
}) => {
	return (
		<ScrollContainer>
			<div className={styles["container"]}>
				{tags.map(({ label, key }) => (
					<Tag
						key={label}
						name="one"
						size="xxs"
						shape="rounded"
						view="filled"
						checked={selectedTags[key]}
						onClick={() =>
							onChange({ ...selectedTags, [key]: !selectedTags[key] })
						}
					>
						{label}
					</Tag>
				))}
			</div>
		</ScrollContainer>
	);
};
