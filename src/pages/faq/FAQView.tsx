import { Space } from "@alfalab/core-components/space";
import { PureCell } from "@alfalab/core-components/pure-cell";
import { Typography } from "@alfalab/core-components/typography";
import { ChevronDownSIcon } from "@alfalab/icons-glyph/ChevronDownSIcon";

import { usePageSettings, useToggle } from "@/lib/hooks";

import styles from "./FAQView.module.css";
import { useRef } from "react";

const data = [
	{
		title: "Какой партнёр Альфа-банка предоставляет данный Сервис?",
		description:
			"Сервис по продаже Билетов (Бланков строгой отчетности, Электронных билетов) предоставляет компания КАССИР.РУ, она же является Агентом по оказанию услуг бронирования, оформлению, формированию, реализации и возврата Билетов, а также по информационной поддержке Покупателя, посредством данного Сервиса.",
	},
	{
		title: "Что такое Сервисный сбор и за что он взимается?",
		description:
			"Сервисный сбор - денежные средства, взимаемые с Покупателя, при реализации ему Билета (Бланк строгой отчетности, Электронного билета) за оказываемые Агентом услуги.",
	},
	{
		title: "Я купил билет, что дальше?",
		description:
			"В первую очередь проверьте доступность билета в сервисе. Зайдите Аккаунт - Заказы и выберете нужный заказ. Проход на мероприятия осуществляет по штрих-коду или QR коду, которые есть на каждом билете.",
	},
	{
		title:
			"При покупке билетов ошибочно выбрал/а не ту дату мероприятия. Можете обменять мне билеты на другую дату?",
		description:
			"Обмен билетов мы не производим, это технически невозможно. Вы можете приобрести нужные Вам билеты, а за уже купленные мы вернем Вам деньги на карту, которой производилась оплата. Для возврата Билета необходимо зайти Аккаунт - Заказы, выбрать нужный заказ и заполнить форму возврата билета.",
	},
	{
		title:
			"Купил/а билеты, но по некоторым причинам не могу посетить мероприятие. Могу вернуть билеты и получить денежные средства обратно?",
		description:
			"Для возврата Билета необходимо зайти Аккаунт - Заказы, выбрать нужный заказ и заполнить форму возврата билета.",
	},
];

type ItemProps = {
	title: string;
	description: string;
};

const Item: React.FC<ItemProps> = ({ title, description }) => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [isCollapsed, toggleCollapsed] = useToggle(true);

	return (
		<div>
			<button
				type="button"
				onClick={() => toggleCollapsed()}
				style={{ width: "100%" }}
			>
				<PureCell direction="horizontal" verticalPadding="none">
					<PureCell.Content>
						<PureCell.Main>
							<PureCell.Text titleColor="primary" view="component-primary">
								{title}
							</PureCell.Text>
						</PureCell.Main>
					</PureCell.Content>

					<PureCell.Graphics verticalAlign="center">
						<ChevronDownSIcon
							width={20}
							height={20}
							color="var(--color-light-graphic-tertiary)"
							style={{
								transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)",
							}}
						/>
					</PureCell.Graphics>
				</PureCell>
			</button>

			<div
				className={styles["item-collapsible"]}
				style={{
					height: isCollapsed
						? "0px"
						: `${containerRef.current?.clientHeight || 0}px`,
				}}
			>
				<div ref={containerRef} style={{ display: "flex" }}>
					<div className={styles["item-description"]}>
						<Typography.Text view="primary-small" color="secondary">
							{description}
						</Typography.Text>
					</div>
				</div>
			</div>
		</div>
	);
};

export const Component: React.FC = () => {
	usePageSettings({
		pageId: 3,
		pageTitle: "Частые вопросы",
	});

	return (
		<div className={styles["container"]}>
			<Space size="l" fullWidth>
				{data.map(({ title, description }) => (
					<Item key={title} title={title} description={description} />
				))}
			</Space>
		</div>
	);
};
