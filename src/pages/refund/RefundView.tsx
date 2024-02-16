import { Fragment, Suspense, useState } from "react";
import {
	useNavigate,
	useParams,
	useRouteLoaderData,
	Await,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { PhoneInput } from "@alfalab/core-components/phone-input";
import { Button } from "@alfalab/core-components/button";
import { Input } from "@alfalab/core-components/input";
import { Space } from "@alfalab/core-components/space";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";
import { Checkbox } from "@alfalab/core-components/checkbox";
import { RadioGroup } from "@alfalab/core-components/radio-group";
import { Radio } from "@alfalab/core-components/radio";

import { NonCriticalError } from "@/components/error/NonCriticalError";
import { usePageSettings, useToggle } from "@/lib/hooks";
import { apiService } from "@/lib/api";
import { APIError } from "@/lib/error";
import { PageLoader } from "@/components/page-loader/PageLoader";
import { GetTicketsByOrderResult } from "@/lib/types";

import styles from "./RefundView.module.css";

type TicketData = GetTicketsByOrderResult & {
	action: {
		actionName: string;
		poster: string;
		date: Date;
	};
};

type PageProps = {
	data: TicketData;
};

const Page: React.FC<PageProps> = ({ data }) => {
	const params = useParams();
	const navigate = useNavigate();
	const [isAccept, toggleAccept] = useToggle();
	const [isOpenModal, toggleOpenModal] = useToggle();
	const [isSubmitting, toggleSubmitting] = useToggle();
	const [error, setError] = useState<APIError | null>(null);
	const [name, setName] = useState(data.user.name);
	const [email, setEmail] = useState(data.user.email);
	const [phone, setPhone] = useState(data.user.phone);

	const submitForm: React.FormEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		const data = new FormData(event.target as HTMLFormElement);

		apiService
			.refund({
				oid: String(params.oid),
				name: data.get("name")?.toString(),
				email: data.get("email")?.toString(),
				phone: data.get("phone")?.toString(),
				reason: data.get("reason")?.toString(),
			})
			.then(() => {
				toggleOpenModal(true);
			})
			.catch((err) => {
				if (err instanceof APIError && err.type === "message") {
					setError(err);
				} else {
					throw err;
				}
			})
			.finally(() => {
				toggleSubmitting(false);
			});
	};

	return (
		<Fragment>
			<form onSubmit={submitForm} className={styles["container"]}>
				<Space fullWidth size="l">
					<Input
						name="name"
						value={name}
						onChange={(_, { value }) => setName(value)}
						placeholder="Введите текст"
						block
						label="ФИО заявителя"
						labelView="outer"
						size="m"
						required
					/>
					<Input
						name="email"
						value={email}
						onChange={(_, { value }) => setEmail(value)}
						placeholder="Введите email"
						block
						label="Email заявителя"
						labelView="outer"
						size="m"
						required
					/>
					<PhoneInput
						name="phone"
						value={phone}
						onChange={(_, { value }) => setPhone(value)}
						placeholder="+7 (___) ___-__-__"
						block
						label="Номер телефона"
						labelView="outer"
						size="m"
						required
					/>
					<Checkbox
						block={true}
						size="m"
						onChange={() => toggleAccept()}
						checked={isAccept}
						label={
							<Typography.Text tag="p" view="primary-small">
								Подтверждаю свои данные и соглашаюсь с условиями оферты и
								обработки персональных данных
							</Typography.Text>
						}
						required
					/>

					<RadioGroup name="reason" label="Выберите ппричину возврата">
						<Radio label="Возврат по болезни" value="1" size="m" required />
						<Radio label="Возврат за 7 дней" value="2" size="m" required />
						<Radio label="Возврат за 14 дней" value="3" size="m" required />
						<Radio
							label="Возврат без уважительной причины"
							value="4"
							size="m"
							required
						/>
					</RadioGroup>
				</Space>

				<Button
					type="submit"
					view="primary"
					block
					loading={isSubmitting}
					className={styles["action-button"]}
				>
					Отправить
				</Button>
			</form>

			<BottomSheet
				open={isOpenModal}
				onClose={() => toggleOpenModal(false)}
				actionButton={
					<Button
						block
						size="s"
						view="primary"
						onClick={() => navigate(`/city/${localStorage.getItem("city")}`)}
					>
						На главный
					</Button>
				}
				stickyHeader
				usePortal
			>
				<div className={styles["modal-message"]}>
					<Typography.Text view="primary-medium" color="secondary">
						Заявка отправлена, скоро деньги вернутся на счёт. Для уточнения
						подробностей с вами свяжется оператор
					</Typography.Text>
				</div>
			</BottomSheet>

			<NonCriticalError
				open={Boolean(error)}
				message={error?.message}
				advice={error?.advice}
				onClose={() => setError(null)}
				action={{
					label: "Вернуться",
					callback: () => setError(null),
				}}
			/>
		</Fragment>
	);
};

export const Component: React.FC = () => {
	const data = useRouteLoaderData("ticket") as { ticket: TicketData };

	usePageSettings({
		pageId: 5,
		pageTitle: "Возврат билета",
	});

	return (
		<Suspense fallback={<PageLoader />}>
			<Await resolve={data.ticket}>{(ticket) => <Page data={ticket} />}</Await>
		</Suspense>
	);
};
