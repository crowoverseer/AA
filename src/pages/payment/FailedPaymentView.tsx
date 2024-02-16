import { LoaderFunction, useLoaderData, useNavigate } from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { CrossHeavyMIcon } from "@alfalab/icons-glyph/CrossHeavyMIcon";

import { usePageSettings } from "@/lib/hooks";
import { apiService } from "@/lib/api";
import { FailPayResult } from "@/lib/types";

import styles from "./PaymentView.module.css";

export const Component: React.FC = () => {
	const data = useLoaderData() as FailPayResult;
	const navigate = useNavigate();

	usePageSettings({
		pageId: 3,
		pageTitle: "Неудачная оплата",
	});

	return (
		<div className={styles["container"]}>
			<Space size="s" align="center" className={styles["centered"]}>
				<SuperEllipse size={80} backgroundColor="#F15045">
					<CrossHeavyMIcon color="white" />
				</SuperEllipse>

				<Typography.TitleMobile
					tag="h1"
					view="small"
					weight="medium"
					className={styles["heading"]}
				>
					{data.message}
				</Typography.TitleMobile>

				<Typography.Text tag="p" className={styles["message"]}>
					{data.advice}
				</Typography.Text>
			</Space>

			<Space size={8} fullWidth>
				<Button
					view="primary"
					size="m"
					block
					onClick={() => navigate("/orders", { replace: true })}
				>
					В ваши заказы
				</Button>

				<Button
					view="secondary"
					size="m"
					block
					onClick={() =>
						navigate(`/city/${localStorage.getItem("city")}`, { replace: true })
					}
				>
					К списку событий
				</Button>
			</Space>
		</div>
	);
};

export const loader: LoaderFunction = ({ params, request }) => {
	const bid = new URL(request.url).searchParams.get("orderId");

	return apiService.failPay({
		token: String(params.api_key),
		oid: Number(params.oid),
		bid: String(bid),
	});
};
