const EMAIL_REGEX =
	/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export function validateEmail(value: string) {
	if (value === "") {
		return "Это поле обязательно";
	} else if (!EMAIL_REGEX.test(value)) {
		return "Некорректный email";
	} else {
		return null;
	}
}
