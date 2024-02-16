import { useEffect } from "react";

import { detectPlatform, Platform } from "../utils/detectPlatform";
import { setPageId } from "../utils/pageSettings";

const DEFAULT_PAGE_TITLE = "";

type PageSetting = {
	pageId?: number;
	pageTitle?: string;
};

export function usePageSettings(params: PageSetting) {
	useEffect(() => {
		const platform = detectPlatform();
		const pageTitle = params.pageTitle || DEFAULT_PAGE_TITLE;

		params.pageId && setPageId(params.pageId);

		if (platform === Platform.ANDROID) {
			// @ts-ignore
			window.Android?.setPageSettings(JSON.stringify(params));
		} else if (platform === Platform.IOS) {
			const pageTitleStr = `?pageTitle=${encodeURIComponent(pageTitle)}`;
			const pageIdStr = params.pageId ? `&pageId=${params.pageId}` : "";

			window.location.replace(
				`ios:setPageSettings/${pageTitleStr}${pageIdStr}`,
			);
		}
	}, [params]);
}
