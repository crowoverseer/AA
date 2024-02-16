import { useEffect, useRef, useState } from "react";

import styles from "./Disclosure.module.css";

type DisclosureProps = React.HTMLAttributes<HTMLDivElement> & {
	open: boolean;
	className?: string;
	children: React.ReactNode;
};

export const Disclosure: React.FC<DisclosureProps> = ({
	className,
	children,
	open,
	...props
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(() => {
		return containerRef.current?.clientHeight || 0;
	});

	useEffect(() => {
		setHeight(containerRef.current?.clientHeight || 0);
	}, [children]);

	return (
		<div
			className={styles["container"]}
			style={{
				height: open ? height : 0,
			}}
			{...props}
		>
			<div ref={containerRef} className={className}>
				{children}
			</div>
		</div>
	);
};
