import { cn } from '@renderer/lib/utils';
import { createContext, forwardRef, HTMLProps, useCallback, useRef, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList } from 'react-window';

interface ByteViewProps {
	data: number[];
	className?: string;
} 

interface ByteCellProps {
	offset: number;
	value: number;
	cellIndex: number;
	highlightedByte: number | null;
	selectedByte: number | null;
	setHighlightedByte(value: number | null): void;
	setSelectedByte(value: number | null): void;
}

interface ByteViewContext {
	setHighlightedByte(value: number | null): void;
}

const cellClasses = 'data-[state=selected]:bg-violet-200 data-[state=highlighted]:bg-zinc-200 dark:data-[state=highlighted]:bg-zinc-800 ';
const ByteViewContext = createContext<ByteViewContext>({ setHighlightedByte(_: number | null): void {} });

export function ByteView({ data, className }: ByteViewProps): JSX.Element {
	const listRef = useRef<FixedSizeList | null>();
	const [highlightedByte, setHighlightedByte] = useState<number | null>(null);

	const [selectedByte, setSelectedByte] = useState<number | null>(null);
	const toggleSelectedByte = useCallback((value: number) => {
		if (selectedByte === value) {
			setSelectedByte(null);
		} else {
			setSelectedByte(value)
		}
	}, [selectedByte, setSelectedByte]);

	return <ByteViewContext.Provider value={{ setHighlightedByte }}>
		<div className={cn(className, 'flex flex-col')}>
			<div className="grow border-b-[1px]">
				<AutoSizer disableWidth={true}>
					{ ({ height }) =>
						<FixedSizeList
							height={height}
							itemCount={(data.length / 16) + 1}
							itemSize={22}
							innerElementType={ByteTable}
							outerElementType={ByteTableContainer}
							ref={el => (listRef.current = el)}
						> { ({ index, style }) => {
							const highlighted = highlightedByte && Math.floor(highlightedByte / 16) === index;
							return <tr key={index} className={highlighted ? 'bg-zinc-100 dark:bg-zinc-900' : ''} style={style}>
								<td className="text-zinc-500 select-none">0x{(index * 16).toString(16).padStart(4, '0')}</td>
								{range(16).map(cellIndex => {
									const offset = (index * 16) + cellIndex;
									return <HexCell
										key={cellIndex}
										offset={offset}
										value={data[offset]}
										cellIndex={cellIndex}
										highlightedByte={highlightedByte}
										setHighlightedByte={setHighlightedByte}
										selectedByte={selectedByte}
										setSelectedByte={toggleSelectedByte}
									/>
								})}
								{range(16).map(cellIndex => {
									const offset = (index * 16) + cellIndex;
									return <AsciiCell
										key={cellIndex}
										offset={offset}
										value={data[offset]}
										cellIndex={cellIndex}
										highlightedByte={highlightedByte}
										setHighlightedByte={setHighlightedByte}
										selectedByte={selectedByte}
										setSelectedByte={toggleSelectedByte}
									/>
								})}
							</tr>
						}}
						</FixedSizeList>
					}
				</AutoSizer>
			</div>
			<div className="flex-none text-sm flex">
				<div className="p-2 border-r-[1px]">Selected offset: 
					<span className="font-mono">
						{selectedByte ?
							<> 0x{selectedByte.toString(16).padStart(4, '0')}</> :
							<> None</>
						}
					</span>
				</div>
				<div className="p-2 grow">Highlighted offset:
					<span className="font-mono">
						{highlightedByte ?
							<> 0x{highlightedByte?.toString(16)?.padStart(4, '0')}</> :
							<> None</>
						}
					</span>
				</div>
			</div>
		</div>
	</ByteViewContext.Provider>
}

const ByteTableContainer = forwardRef<HTMLDivElement>(({ children, ...rest}: HTMLProps<HTMLDivElement>, ref) => {
	return <div {...rest} ref={ref}>
		{children}
	</div>
});

const ByteTable = forwardRef<HTMLDivElement>(({ children, ...rest }: HTMLProps<HTMLDivElement>, ref) => {
	return <ByteViewContext.Consumer>
		{ ({ setHighlightedByte }) =>
			<div {...rest} onMouseLeave={() => setHighlightedByte(null)} ref={ref}>
				<table className="font-mono text-sm">
					<tbody>{children}</tbody>
				</table>
			</div>
		}
	</ByteViewContext.Consumer>
});

function HexCell({ offset, value, cellIndex, highlightedByte, setHighlightedByte, selectedByte, setSelectedByte }: ByteCellProps): JSX.Element {
	return <td
		className={cellClasses + (cellIndex % 4 === 0 ? 'pl-2' : '')}
		onMouseOver={() => setHighlightedByte(offset)}
		onClick={() => setSelectedByte(offset)}
		data-state={selectedByte === offset ? 'selected' : highlightedByte === offset ? 'highlighted' : null}
	>
		{value?.toString(16)?.padStart(2, '0') ?? <span className="text-zinc-300 dark:text-zinc-900">&nbsp;&nbsp;</span>}
	</td>
}

function AsciiCell({ offset, value, cellIndex, highlightedByte, setHighlightedByte, selectedByte, setSelectedByte }: ByteCellProps): JSX.Element {
	const isPrintable = value >= 33 && value <= 126;
	return <td
		className={cellClasses + (cellIndex % 8 === 0 ? 'pl-2' : '')}
		onMouseOver={() => setHighlightedByte(offset)}
		onClick={() => setSelectedByte(offset)}
		data-state={selectedByte === offset ? 'selected' : highlightedByte === offset ? 'highlighted' : null}
	>
		{
			isPrintable ? String.fromCharCode(value ?? 46)
				: <span className="text-zinc-300 dark:text-zinc-900">
					{value === undefined ? <>&nbsp;</> : '.'}
				</span>
		}
	</td>
}

function range(length: number): number[] {
	return [...Array(length).keys()];
}
