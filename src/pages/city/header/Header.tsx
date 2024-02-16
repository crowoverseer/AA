import { useNavigate } from "react-router-dom";
import ScrollContainer from "react-indiana-drag-scroll";
import { Input } from "@alfalab/core-components/input";
import { Badge } from "@alfalab/core-components/badge";
import { Typography } from "@alfalab/core-components/typography";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { IconButton } from "@alfalab/core-components/icon-button";
import { MagnifierMIcon } from "@alfalab/icons-glyph/MagnifierMIcon";
import { SlidersMIcon } from "@alfalab/icons-glyph/SlidersMIcon";
import { UserLineMIcon } from "@alfalab/icons-glyph/UserLineMIcon";
import cx from "classnames";

import { useActions } from "@/lib/actions/ActionsContext";

import styles from "./Header.module.css";
import { Fragment } from "react";

type NavItemProps = {
	label: string;
	active?: boolean;
	onClick(): void;
};

const NavItem: React.FC<NavItemProps> = ({ label, active, onClick }) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cx(styles["tab"], active && styles["tab-active"])}
		>
			<Typography.Text view="primary-small" style={{ whiteSpace: "nowrap" }}>
				{label}
			</Typography.Text>
		</button>
	);
};

export const Header: React.FC = () => {
	const navigate = useNavigate();
	const { menus, filters, setFilters, city, totalFiltersCount } = useActions();

	const selectMenu = (menuId: string | null) => {
		setFilters((state) => ({
			...state,
			menu: menuId,
		}));
	};

	return (
		<Fragment>
			<div className={styles["search-section"]}>
				<SuperEllipse size={40} backgroundColor="transparent">
					<IconButton
						onClick={() => navigate("/account")}
						icon={UserLineMIcon}
						size="xxs"
						aria-label="Аккаунт"
					/>
				</SuperEllipse>

				<Input
					size="s"
					block
					placeholder={city ? `Поиск ${city.where}` : "Поиск"}
					leftAddons={
						<MagnifierMIcon color="var(--color-dark-graphic-secondary)" />
					}
					onFocus={() => navigate(`${location.pathname}/search`)}
					readOnly
				/>

				<div className={styles["filter-buttons"]}>
					<SuperEllipse
						size={40}
						backgroundColor="transparent"
						topAddons={
							<Badge view="count" height={16} content={totalFiltersCount} />
						}
					>
						<IconButton
							onClick={() => navigate(`${location.pathname}/filters`)}
							icon={SlidersMIcon}
							size="xxs"
							aria-label="Фильтры"
						/>
					</SuperEllipse>
				</div>
			</div>

			<div className={styles["menu-section"]}>
				<ScrollContainer className={styles["scroll-container"]}>
					<NavItem
						label="Все"
						active={filters.menu === null}
						onClick={() => selectMenu(null)}
					/>

					{menus.map((menu) => (
						<NavItem
							key={menu.menuId}
							label={menu.menuName}
							active={filters.menu === menu.menuId}
							onClick={() => selectMenu(menu.menuId)}
						/>
					))}
				</ScrollContainer>
			</div>
		</Fragment>
	);
};
