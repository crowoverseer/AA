import { Link } from "react-router-dom";
import { Space } from "@alfalab/core-components/space";
import { Typography } from "@alfalab/core-components/typography";
import { PureCell } from "@alfalab/core-components/pure-cell";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { BookMIcon } from "@alfalab/icons-glyph/BookMIcon";
// import { UserMIcon } from "@alfalab/icons-glyph/UserMIcon";
// import { LockClosedMIcon } from "@alfalab/icons-glyph/LockClosedMIcon";
import { HousesMIcon } from "@alfalab/icons-glyph/HousesMIcon";
import { Switch } from "@alfalab/core-components/switch";
import preval from "preval.macro";

import pkg from "../../../package.json";

import { usePageSettings } from "@/lib/hooks";
// import { useTheme } from "@/lib/theme";

import styles from "./AccountView.module.css";

const buildDate = preval`
module.exports = new Intl.DateTimeFormat('ru', { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date())
`;

type MenuItemProps = {
	title: string;
	subtitle: string;
	icon: React.ReactNode;
	checked?: boolean;
	onToggle?: () => void;
};

const MenuItem: React.FC<MenuItemProps> = ({
	title,
	subtitle,
	icon,
	checked,
	onToggle,
}) => {
	return (
		<PureCell direction="horizontal" verticalPadding="tiny">
			<PureCell.Graphics>
				<SuperEllipse size={48}>{icon}</SuperEllipse>
			</PureCell.Graphics>
			<PureCell.Content>
				<PureCell.Main>
					<PureCell.Text titleColor="primary" view="component-primary">
						{title}
					</PureCell.Text>
					<PureCell.Text titleColor="secondary" view="primary-small">
						{subtitle}
					</PureCell.Text>
				</PureCell.Main>
				{onToggle && (
					<PureCell.Addon verticalAlign="center">
						<Switch checked={checked} onChange={onToggle} />
					</PureCell.Addon>
				)}
			</PureCell.Content>
		</PureCell>
	);
};

export const Component: React.FC = () => {
	// const { theme, toggleTheme } = useTheme();

	usePageSettings({
		pageId: 2,
		pageTitle: "Личный кабинет",
	});

	return (
		<div className={styles["container"]}>
			<Space size="l" fullWidth>
				<Link to="/orders">
					<MenuItem
						title="Заказы"
						subtitle="История ваших покупок"
						icon={<BookMIcon color="var(--color-light-graphic-tertiary)" />}
					/>
				</Link>
				{/* <Link to="/settings/city">
					<MenuItem
						title="Выбор города"
						subtitle="Ваш город"
						icon={
							<PinLocationMIcon color="var(--color-light-graphic-tertiary)" />
						}
					/>
				</Link> */}
				{/* <Link to="/account">
					<MenuItem
						title="Персональные данные"
						subtitle="Ваши данные"
						icon={
							<LockClosedMIcon color="var(--color-light-graphic-tertiary)" />
						}
					/>
				</Link> */}
				<Link to="/faq">
					<MenuItem
						title="Информация"
						subtitle="Подробнее о сервисе, покупке и возврате билетов"
						icon={<HousesMIcon color="var(--color-light-graphic-tertiary)" />}
					/>
				</Link>
				{/* <button
					type="button"
					onClick={() => toggleTheme()}
					style={{
						width: "100%",
					}}
				>
					<MenuItem
						title="Переключить тему"
						subtitle="Светлая/Темная"
						icon={
							<InformationCircleMIcon color="var(--color-light-graphic-tertiary)" />
						}
						checked={theme === "dark"}
						onToggle={() => toggleTheme()}
					/>
				</button> */}
				{/* <Link to="/account">
					<MenuItem
						title="Поддержка"
						subtitle="Ответим на возникающие вопросы"
						icon={<UserMIcon color="var(--color-light-graphic-tertiary)" />}
					/>
				</Link> */}
			</Space>

			<div>
				<Typography.Text view="primary-small" color="secondary">
					Версия: {pkg.version}-{buildDate}
				</Typography.Text>
			</div>
		</div>
	);
};
