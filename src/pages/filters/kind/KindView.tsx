import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@alfalab/core-components/button";
import { RadioGroup } from "@alfalab/core-components/radio-group";
import { Radio } from "@alfalab/core-components/radio";

import { useActions } from "@/lib/actions/ActionsContext";
import { usePageSettings } from "@/lib/hooks";
import { Kind } from "@/lib/types";

import styles from "./KindView.module.css";

export const FiltersKindView: React.FC = () => {
	const navigate = useNavigate();
	const { city, kinds, filters, setFilters } = useActions();
	const [kind, setKind] = useState<Kind | null>(filters.kind);

	usePageSettings({
		pageId: 5,
		pageTitle: "Категории",
	});

	const apply = () => {
		setFilters({
			...filters,
			kind,
		});

		navigate(`/city/${city.cityId}/filters`);
	};

	return (
		<div className={styles["container"]}>
			<div className={styles["content"]}>
				<RadioGroup
					onChange={(_, { value }) => {
						setKind(value !== "-1" ? kinds[Number(value)] : null);
					}}
					value={
						kind
							? String(kinds.findIndex(({ kindId }) => kindId === kind.kindId))
							: "-1"
					}
					className={styles["list"]}
				>
					<Radio label="Все" value={"-1"} size="m" />
					{Object.values(kinds).map(({ kindId, kindName }, idx) => (
						<Radio key={kindId} label={kindName} value={String(idx)} size="m" />
					))}
				</RadioGroup>
			</div>

			<div className={styles["button-group"]}>
				<Button view="primary" size="s" block onClick={apply}>
					Применить
				</Button>
			</div>
		</div>
	);
};
