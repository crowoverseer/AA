import { useEffect } from "react";

import { detectPlatform, Platform } from "../utils/detectPlatform";
import { setPageId } from "../utils/pageSettings";

export function usePageId(pageId: number) {
	useEffect(() => {
		const platform = detectPlatform();

		const urlSearchParams = new URLSearchParams(window.location.search);
		const params = Object.fromEntries(urlSearchParams.entries());

		setPageId(pageId);

		if (platform === Platform.ANDROID) {
			// @ts-ignore
			window.Android?.setPageSettings(
				JSON.stringify({ ...params, pageId: String(pageId) }),
			);
		} else if (platform === Platform.IOS) {
			const qParams = new URLSearchParams({
				...params,
				pageId: String(pageId),
			});

			window.location.replace(`ios:setPageSettings/?${qParams.toString()}`);
		}
	}, [pageId]);
}
