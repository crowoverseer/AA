import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Autoplay, Navigation } from "swiper";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import { Typography } from "@alfalab/core-components/typography";
import cx from "classnames";
import { ArrowLeftMIcon } from "@alfalab/icons-glyph/ArrowLeftMIcon";
import { ArrowRightMIcon } from "@alfalab/icons-glyph/ArrowRightMIcon";

import "swiper/css";

import { Cashback } from "@/components/cashback/Cashback";
import { formatString } from "@/lib/utils/formatString";
import { SliderItem } from "@/lib/types";

import styles from "./Slider.module.css";

type VideoProps = React.DetailedHTMLProps<
	React.VideoHTMLAttributes<HTMLVideoElement>,
	HTMLVideoElement
> & {
	active: boolean;
};

const Video: React.FC<VideoProps> = ({ src, active, ...props }) => {
	const videoRef = useRef<HTMLVideoElement | null>(null);

	useEffect(() => {
		if (videoRef.current) {
			videoRef.current.muted = true;
			videoRef.current.defaultMuted = true;

			if (active) {
				videoRef.current.play();
			} else {
				videoRef.current.pause();
				videoRef.current.currentTime = 0;
			}
		}
	}, [active]);

	return (
		<video
			ref={videoRef}
			autoPlay
			loop
			muted
			playsInline={false}
			preload="none"
			{...props}
		>
			<source src={src} type="video/mp4" />
		</video>
	);
};

type SliderProps = {
	data: Array<SliderItem>;
};

export const Slider: React.FC<SliderProps> = ({ data }) => {
	const navigate = useNavigate();
	const [activeIndex, setActiveIndex] = useState(0);
	const swiperRef = useRef<SwiperRef | null>(null);
	const [timer, setTimer] = useState(0);
	const intervalRef = useRef<NodeJS.Timer>();

	// useEffect(() => {
	// 	const fr = 1000 / 60;

	// 	setTimer(0);

	// 	intervalRef.current = setInterval(() => {
	// 		setTimer((prev) => {
	// 			const nextValue = prev + fr;

	// 			if (nextValue === 7000) {
	// 				clearInterval(intervalRef.current);

	// 				return 0;
	// 			} else {
	// 				return nextValue;
	// 			}
	// 		});
	// 	}, fr);

	// 	return () => {
	// 		clearInterval(intervalRef.current);
	// 	};
	// }, [activeIndex]);

	if (data.length === 0) {
		return null;
	}

	return (
		<div className={styles["container"]}>
			<Swiper
				// ref={swiperRef}
				// spaceBetween={0}
				slidesPerView={1}
				loop
				// navigation={{
				// 	nextEl: ".swiper-button-next",
				// 	prevEl: ".swiper-button-prev",
				// }}
				autoplay={{
					delay: 7000,
					pauseOnMouseEnter: false,
					disableOnInteraction: false,
				}}
				modules={[Autoplay]}
				// onSlideChange={({ realIndex }) => setActiveIndex(realIndex)}
			>
				{data.map((slide, idx) => (
					<SwiperSlide
						className={styles["slide-container"]}
						key={slide.id}
						onClick={() =>
							navigate(
								slide.eventId
									? `/city/${slide.cityId}/${slide.venueId}_${slide.actionId}/reservation/${slide.eventId}`
									: `/city/${slide.cityId}/${slide.venueId}_${slide.actionId}`,
							)
						}
					>
						<div className={styles["slide"]}>
							<div className={styles["slide-header"]}>
								{slide.video ? (
									<Video
										src={slide.video}
										poster={slide.picture}
										active={idx === activeIndex}
										className={styles["slide-cover"]}
									/>
								) : (
									<img
										src={slide.picture}
										alt={slide.title}
										className={styles["slide-cover"]}
									/>
								)}

								<div className={styles["cashback"]}>
									<Cashback value={`${slide.cashback}%`} />
								</div>
							</div>

							<div className={styles["content"]}>
								<div className={styles["content-left"]}>
									<Typography.Text weight="bold">
										{formatString(slide.title) || "title"}
									</Typography.Text>
									<Typography.Text view="primary-small">
										{slide.dates}
									</Typography.Text>
									<Typography.Text view="primary-small" color="secondary">
										{formatString(slide.place) || "place"}
									</Typography.Text>
								</div>
							</div>
						</div>
					</SwiperSlide>
				))}

				{/* <div className={styles["controls"]}>
					<Typography.Text color="static-primary-light">
						{activeIndex + 1} / {data.length}
					</Typography.Text>

					<div className={styles["controls-arrows"]}>
						<button
							type="button"
							className={cx(styles["control-arrow"], "swiper-button-prev")}
						>
							<ArrowLeftMIcon style={{ zIndex: 1 }} />
						</button>

						<button
							type="button"
							className={cx(styles["control-arrow"], "swiper-button-next")}
							style={{
								background: `conic-gradient(red ${timer / (7000 / 100)
									}%, transparent 0)`,
							}}
						>
							<ArrowRightMIcon style={{ zIndex: 1 }} />
						</button>
					</div>
				</div> */}
			</Swiper>
		</div>
	);
};
