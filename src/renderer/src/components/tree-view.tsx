import SerializedPacket from "@/types/nex/serialized-packet";
import { cn } from "@renderer/lib/utils";
import { ChevronDown, ChevronRight, Dot } from "lucide-react";
import { useMemo } from "react";
import { NodeRendererProps, RowRendererProps, Tree } from "react-arborist";
import AutoSizer from "react-virtualized-auto-sizer";

interface TreeViewProps {
	packet: SerializedPacket;
}

interface Tree {
	id: string;
	name: string;
	children?: Tree[];
	value?: any;
}

export function TreeView({ packet }: TreeViewProps): JSX.Element {
	const data = useMemo(() => {
		return treeFromObject(packet).children
	}, []);

	return <div className="h-full w-full font-mono whitespace-nowrap">
		<AutoSizer>{ ({ height, width }) =>
			<Tree
			 	height={height}
				width={width}
				initialData={data}
				openByDefault={false}
				disableDrag={true}
				disableEdit={true}
				renderRow={Row}
			>{Node}</Tree>
		}</AutoSizer>
	</div>
}

function Row({ children, attrs }: RowRendererProps<Tree>): JSX.Element {
	const { style, ...rest } = attrs;

	return <div
	 	style={{
			...style,
			maxHeight: style?.height,
			top: `${(style?.top as number ?? 0) + 8}px`,
			left: '8px',
			width: 'calc(100% - 8px)'
		}}
		{...rest}
	>{children}</div>
}

function Node({ node, style }: NodeRendererProps<Tree>): JSX.Element {
	return <div style={style}>
		{node.isLeaf ? <Dot className="inline mr-1 text-zinc-300 dark:text-zinc-700" size={18} /> :
			node.isOpen ?
				<ChevronDown className="inline mr-1" size={18} onClick={() => node.toggle()} /> :
				<ChevronRight className="inline mr-1" size={18} onClick={() => node.toggle()} />
		}
		{node.data.name}
		{node.data.value ? <span>: {JSON.stringify(node.data.value)}</span> : null}
	</div>
}

function treeFromObject(object: any, path: string[] = ['']): Tree {
	const id = path.join('/');
	const name = path[path.length - 1];

	if (typeof object === 'object') {
		const children = Array.isArray(object) ?
			object.map((value, i) => treeFromObject(value, [...path, i.toString()])) :
			Object.getOwnPropertyNames(object).map(key => treeFromObject(object[key], [...path, key]));

		return { id, name, children};
	} else {
		return { id, name, value: object };
	}
}
