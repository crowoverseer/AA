import { useRef, useEffect } from "react";

import { createContext } from "@/lib/utils/context";

export type NodesContext = {
	registerItem(item: { id: string; ref: HTMLDivElement }): void;
	unregisterItem(id: string): void;
};

export const [useNodesContext, NodesContextProvider] =
	createContext<NodesContext>("Nodes");

type NodeItemProps = {
	id: string;
	children: React.ReactNode;
};

export const NodeItem: React.FC<NodeItemProps> = ({ id, children }) => {
	const nodeContext = useNodesContext();
	const itemRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (itemRef.current) {
			nodeContext.registerItem({ id, ref: itemRef.current });

			return () => {
				nodeContext.unregisterItem(id);
			};
		}
	}, [id]);

	return <div ref={itemRef}>{children}</div>;
};
