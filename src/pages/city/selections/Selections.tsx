import { useEffect, useMemo } from "react";
import { Button } from "@alfalab/core-components/button";

import { useActions } from "@/lib/actions/ActionsContext";
import { useToggle } from "@/lib/hooks";
import { Selection } from "@/lib/types";

import { Stories } from "./stories/Stories";

import styles from "./Selections.module.css";

type SelectionsProps = {
	data: Selection[];
};

export const Selections: React.FC<SelectionsProps> = ({ data }) => {
	const {
		selections: citySelections,
		totalFiltersCount,
		filters,
	} = useActions();
	const [isShowAllSelections, toggleShowAllSelections] = useToggle(false);

	const hasAppliedFilters = totalFiltersCount > 0 || filters.menu !== null;

	const selections = useMemo(() => {
		if (isShowAllSelections) {
			return data;
		} else {
			return [...data].slice(0, 2);
		}
	}, [data, isShowAllSelections, filters, totalFiltersCount]);

	const hasSelectionsButton =
		totalFiltersCount > 0 || citySelections.length > 3;

	if (hasAppliedFilters) {
		return null;
	}

	return (
		<div className={styles["container"]}>
			{selections.map((selection) => (
				<Stories key={selection.id} data={selection} />
			))}

			{hasSelectionsButton && (
				<div className={styles["show-more-button"]}>
					<Button
						block
						view="secondary"
						onClick={() => toggleShowAllSelections()}
					>
						{isShowAllSelections
							? "Скрыть подборки"
							: "Посмотреть другие подборки"}
					</Button>
				</div>
			)}
		</div>
	);
};
