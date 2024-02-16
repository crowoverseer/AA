import { useEffect } from "react";

import { detectPlatform, Platform } from "../utils/detectPlatform";
import { PageId } from "../utils/pageSettings";

export function usePageTitle(pageTitle: string) {
	useEffect(() => {
		const platform = detectPlatform();

		const urlSearchParams = new URLSearchParams(window.location.search);
		const params = Object.fromEntries(urlSearchParams.entries());

		if (platform === Platform.ANDROID) {
			// @ts-ignore
			window.Android?.setPageSettings(JSON.stringify(params));
		} else if (platform === Platform.IOS) {
			const pageTitleStr = `?pageTitle=${encodeURIComponent(pageTitle)}`;
			const pageIdStr = PageId ? `&pageId=${PageId}` : "";

			window.location.replace(
				`ios:setPageSettings/${pageTitleStr}${pageIdStr}`,
			);
		}
	}, [pageTitle]);
}
