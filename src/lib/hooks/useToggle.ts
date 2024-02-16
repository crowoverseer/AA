import { useState } from "react";

type ToggleCallback = (value?: boolean) => void;

export function useToggle(defaultValue = false): [boolean, ToggleCallback] {
	const [isToggle, setToggle] = useState(defaultValue);

	const toggle: ToggleCallback = (value) => {
		setToggle((prev) => (typeof value !== "undefined" ? value : !prev));
	};

	return [isToggle, toggle];
}
