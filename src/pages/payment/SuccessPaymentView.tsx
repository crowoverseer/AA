import React, { Suspense } from "react";
import {
	Await,
	LoaderFunction,
	defer,
	useLoaderData,
	useNavigate,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Space } from "@alfalab/core-components/space";
import { SuperEllipse } from "@alfalab/core-components/icon-view/super-ellipse";
import { CheckmarkHeavyMIcon } from "@alfalab/icons-glyph/CheckmarkHeavyMIcon";

import { PageLoader } from "@/components/page-loader/PageLoader";
import { PageError } from "@/components/error/PageError";
import { usePageSettings } from "@/lib/hooks";
import { apiService } from "@/lib/api";
import { SuccessPayResult } from "@/lib/types";

import styles from "./PaymentView.module.css";

type SuccessPaymentData = {
	successPay: Promise<SuccessPayResult>;
};

type SuccessPaymentProps = {
	data: SuccessPayResult;
};

const SuccessPayment: React.FC<SuccessPaymentProps> = ({ data }) => {
	const navigate = useNavigate();

	return (
		<div className={styles["container"]}>
			<Space size="s" align="center" className={styles["centered"]}>
				<SuperEllipse size={80} backgroundColor="#2FC26E">
					<CheckmarkHeavyMIcon color="white" />
				</SuperEllipse>

				<Typography.TitleMobile
					tag="h1"
					view="small"
					weight="medium"
					className={styles["heading"]}
				>
					{data.message}
				</Typography.TitleMobile>
			</Space>

			<Space size={8} fullWidth>
				<Button
					view="primary"
					size="m"
					block
					onClick={() => navigate(`/orders/${data.orderId}`, { replace: true })}
				>
					Получить билеты
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

				{/* <Button
					view="primary"
					size="m"
					block
					onClick={() => navigate(`/city/${localStorage.getItem("city")}`)}
				>
					К поиску билетов
				</Button> */}

				<Button
					view="secondary"
					size="m"
					block
					onClick={() => navigate(`/city/${localStorage.getItem("city")}`)}
				>
					На главную Афиши
				</Button>
			</Space>
		</div>
	);
};

const SuccessPaymentError: React.FC = () => {
	const navigate = useNavigate();

	return (
		<PageError
			action={{
				label: "Продолжить",
				callback: () => {
					navigate("/orders");
				},
			}}
		/>
	);
};

export const Component: React.FC = () => {
	const data = useLoaderData() as SuccessPaymentData;

	usePageSettings({
		pageId: 3,
		pageTitle: "Успешная оплата",
	});

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.successPay} errorElement={<SuccessPaymentError />}>
				{(data) => <SuccessPayment data={data} />}
			</Await>
		</Suspense>
	);
};

export const loader: LoaderFunction = ({ params, request }) => {
	const bid = new URL(request.url).searchParams.get("orderId");

	const successPayPromise = apiService.successPay({
		token: String(params.api_key),
		oid: Number(params.oid),
		bid: String(bid),
	});

	return defer({
		successPay: successPayPromise,
	});
};
