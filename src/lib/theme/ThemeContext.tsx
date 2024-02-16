import { useMemo, useState } from "react";
import darkMode from "@alfalab/core-components/themes/dark";

import { createContext } from "@/lib/utils/context";

export type Theme = "light" | "dark";

type ThemeContext = {
	theme: Theme;
	toggleTheme(theme?: Theme): void;
};

const [useTheme, ThemeProvider] = createContext<ThemeContext>("Theme");

type WithThemeProps = {
	children: React.ReactNode;
};

const WithTheme: React.FC<WithThemeProps> = ({ children }) => {
	const [theme, setTheme] = useState<Theme>(() => {
		return (localStorage.getItem("theme") as Theme) || "light";
	});

	const toggleTheme = (theme?: Theme) =>
		setTheme((state) => {
			const nextTheme = theme || (state === "light" ? "dark" : "light");

			localStorage.setItem("theme", nextTheme);

			return nextTheme;
		});
	const ctxValue = useMemo(
		() => ({
			theme,
			toggleTheme,
		}),
		[theme],
	);

	return (
		<ThemeProvider value={ctxValue}>
			{theme === "dark" && <style>{darkMode}</style>}
			{children}
		</ThemeProvider>
	);
};

export { useTheme, WithTheme };
