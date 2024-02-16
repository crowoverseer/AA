import { Fragment, useEffect, useRef, useState } from "react";
import {
	useActionData,
	useNavigate,
	useNavigation,
	useSubmit,
} from "react-router-dom";
import { Typography } from "@alfalab/core-components/typography";
import { Button } from "@alfalab/core-components/button";
import { Input } from "@alfalab/core-components/input";
import { BottomSheet } from "@alfalab/core-components/bottom-sheet";

import { NonCriticalError } from "@/components/error/NonCriticalError";
import { validateEmail } from "@/lib/utils/validators";
import { apiService } from "@/lib/api";
import { APIError } from "@/lib/error";

import styles from "./AuthModal.module.css";

type AuthModalProps = {
	open: boolean;
	onSubmit(): void;
	onClose(): void;
};

export const AuthModal: React.FC<AuthModalProps> = ({
	open,
	onClose,
	onSubmit,
}) => {
	const navigation = useNavigation();
	const navigate = useNavigate();
	const [email, setEmail] = useState<string>("");
	const [emailError, setEmailError] = useState<string | null>(null);
	const [error, setError] = useState<APIError | null>(null);
	const dirtyRef = useRef(false);

	const handleChangeEmail = (value: string) => {
		dirtyRef.current && setEmailError(validateEmail(value));
		setEmail(value);
	};

	const handleSubmit = () => {
		dirtyRef.current = true;
		const emailErr = validateEmail(email);

		setEmailError(emailErr);

		if (!emailErr) {
			apiService
				.auth({ email: String(email) })
				.catch((err: APIError) => {
					setError(err);
				})
				.then(() => {
					onSubmit();
				});
		}
	};

	return (
		<Fragment>
			<BottomSheet
				titleSize="compact"
				open={open}
				onClose={onClose}
				hasCloser
				actionButton={
					<Button
						type="button"
						block
						size="s"
						view="primary"
						loading={navigation.state === "submitting"}
						onClick={handleSubmit}
					>
						Войти
					</Button>
				}
				usePortal
			>
				<Typography.TitleMobile
					tag="h2"
					view="small"
					weight="bold"
					className={styles["title"]}
				>
					Введите e-mail
				</Typography.TitleMobile>

				<Typography.Text color="secondary" className={styles["subtitle"]}>
					Мы его запомним и укажем в следующий раз за вас
				</Typography.Text>

				<div className={styles["form"]}>
					<Input
						required
						label="Email"
						block={true}
						size="m"
						value={email}
						onChange={(_, { value }) => handleChangeEmail(value)}
						error={emailError}
					/>
				</div>
			</BottomSheet>

			<NonCriticalError
				open={Boolean(error)}
				message={error?.advice}
				onClose={() => setError(null)}
				action={{
					label: "Вернуться",
					callback: () => navigate("./../..", { replace: true }),
				}}
			/>
		</Fragment>
	);
};
