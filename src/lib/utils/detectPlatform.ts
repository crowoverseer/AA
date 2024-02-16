export enum Platform {
	IOS = "IOS",
	ANDROID = "ANDROID",
	WEB = "WEB",
}

export function detectPlatform(): Platform {
	const userAgent = window.navigator.userAgent.toLowerCase();
	const safari = /safari/.test(userAgent);
	const ios = /iphone|ipod|ipad/.test(userAgent);

	if (ios) {
		if (!safari) {
			return Platform.IOS;
		}
	}

	// @ts-ignore
	if (window.Android) {
		return Platform.ANDROID;
	}

	return Platform.WEB;
}
