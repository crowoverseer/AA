import { LoaderFunction } from "react-router-dom";
import { DaySelector } from "@/components/day-selector/DaySelector";
import { usePageSettings } from "@/lib/hooks/usePageSettings";
import { useActions } from "@/lib/actions/ActionsContext";

import { Header } from "./header/Header";
import { ActionList } from "./action-list/ActionList";
import { Slider } from "./slider/Slider";
import { Selections } from "./selections/Selections";

import styles from "./CityView.module.css";
import { useEffect, useMemo } from "react";

type CityViewProps = {
	pageId: number;
};

export const CityView: React.FC<CityViewProps> = ({ pageId }) => {
	const { slider, filters, selections, totalFiltersCount } = useActions();

	usePageSettings({
		pageId,
		pageTitle: "Афиша",
	});

	const hasSlider = useMemo(() => {
		return totalFiltersCount === 0 && filters.menu === null;
	}, [totalFiltersCount, filters.menu]);

	useEffect(() => {
		window.scrollTo({
			behavior: "instant",
			top: 0,
		});
	}, [hasSlider]);

	return (
		<div>
			<Header />

			{hasSlider && <Slider data={slider} />}

			<div className={styles["container"]}>
				<DaySelector />
				{selections.length > 0 && <Selections data={selections} />}
				<ActionList />
			</div>
		</div>
	);
};

export const cityViewLoader: LoaderFunction = ({ request }) => {
	const item = new URL(request.url).searchParams.get("item");

	return {
		item,
	};
};
