import { Typography } from "@alfalab/core-components/typography";
import { List } from "@alfalab/core-components/list";

import { usePageSettings } from "@/lib/hooks";

import styles from "./RefundPolicyView.module.css";

export const Component: React.FC = () => {
	usePageSettings({
		pageId: 5,
		pageTitle: "Правила возврата",
	});

	return (
		<div className={styles["container"]}>
			<Typography.Text>
				Вернуть онлайн можно и один билет, и сразу несколько. Условия возврата
				денег следующие:
			</Typography.Text>

			<List tag="ol">
				<List.Item>
					До мероприятия остается не менее 10 дней, в этом случается
					возвращается 100% от суммы
				</List.Item>
				<List.Item>От 5 до 10 дней - 50% от суммы</List.Item>
				<List.Item>От 3 до 5 дней - 30% от суммы</List.Item>
				<List.Item>Меньше 3 дней - 0% от суммы</List.Item>
				<List.Item>Сервисный сбор возврату не подлежит</List.Item>
			</List>

			<Typography.Text view="primary-small" color="secondary">
				Оплата будет произведена через сервис «Альфа Банка». В случае возврата
				заказа после оплаты, денежные средства будут перечислены на ваш счёт.
			</Typography.Text>
		</div>
	);
};
