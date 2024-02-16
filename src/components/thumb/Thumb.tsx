import { useEffect, useState } from "react";
import cx from "classnames";

import styles from "./Thumb.module.css";

type ThumbProps = React.ImgHTMLAttributes<HTMLImageElement> & {
	rounded?: "m" | "xl";
};

enum ImageLoadingState {
	IDLE = "IDLE",
	LOADED = "LOADED",
	ERROR = "ERROR",
}

export const Thumb: React.FC<ThumbProps> = ({
	src,
	alt,
	width,
	height,
	rounded,
	className,
	style = {},
	...props
}) => {
	const [loadingState, setLoadingState] = useState<ImageLoadingState>(
		ImageLoadingState.IDLE,
	);

	useEffect(() => {
		if (src) {
			const img = new Image();
			img.src = src;

			img.onload = () => {
				setLoadingState(ImageLoadingState.LOADED);
			};

			img.onerror = () => {
				setLoadingState(ImageLoadingState.ERROR);
			};
		}
	}, [src]);

	return (
		<div
			className={cx(
				styles["container"],
				rounded === "m" && styles["container-rounded-m"],
				rounded === "xl" && styles["container-rounded-xl"],
				className,
			)}
			style={{ width, height }}
		>
			{loadingState === ImageLoadingState.LOADED && (
				<img
					{...props}
					className={styles["image"]}
					width="100%"
					height="100%"
					src={src}
					alt={alt}
					style={style}
				/>
			)}
			{loadingState === ImageLoadingState.ERROR && (
				<div className={styles["placeholder"]}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="var(--icon-button-secondary-base-color)"
						style={{ width: "40px" }}
					>
						<title>Image</title>
						<path
							fillRule="evenodd"
							d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
			)}
		</div>
	);
};
