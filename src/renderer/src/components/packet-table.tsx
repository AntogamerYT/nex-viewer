import { ColumnDef, flexRender, getCoreRowModel, Header, useReactTable, Table as TableDef, getFilteredRowModel, Cell, ColumnFiltersState, Row, RowSelectionState } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@renderer/components/ui/table';
import { Button } from '@renderer/components/ui/button';
import { Input } from '@renderer/components/ui/input';
import { CircleX, Filter, GripVertical, Settings2 } from 'lucide-react';
import React, { CSSProperties, KeyboardEvent, memo, useMemo, useState } from 'react';
import SerializedPacket from '@/types/nex/serialized-packet';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove, horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@renderer/components/ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@renderer/components/ui/dialog';
import { DialogDescription } from '@radix-ui/react-dialog';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@renderer/components/ui/resizable';
import { ScrollArea, ScrollBar } from '@renderer/components/ui/scroll-area';
import { PacketInspector } from '@renderer/components/packet-inspector';

const columns: ColumnDef<SerializedPacket>[] = [
	{
		id: 'time',
		header: 'Time',
		accessorKey: 'time'
	},
	{
		id: 'source',
		header: 'Source',
		accessorFn: row =>
			`${row.source_address}:${row.source_port}`
	},
	{
		id: 'destination',
		header: 'Destination',
		accessorFn: row =>
			`${row.destination_address}:${row.destination_port}`
	},
	{
		id: 'version',
		header: 'Version',
		accessorKey: 'version'
	},
	{
		id: 'type',
		header: 'Type',
		accessorKey: 'type'
	},
	{
		id: 'flags',
		header: 'Flags',
		accessorFn: row =>
			row.flags.join(', ')
	},
	{
		id: 'sessionId',
		header: 'Session ID',
		accessorKey: 'session_id'
	},
	{
		id: 'sequenceId',
		header: 'Sequence ID',
		accessorKey: 'sequence_id'
	},
	{
		id: 'fragmentId',
		header: 'Fragment ID',
		accessorKey: 'fragment_id'
	},
	{
		id: 'info',
		header: 'Info',
		accessorKey: 'info'
	}
];

interface PacketTableProps {
	packets: SerializedPacket[];
}

export function PacketTable({ packets }: PacketTableProps): JSX.Element {
	const [columnOrder, setColumnOrder] = useState(columns.map(column => column.id!));
	const [globalFilter, setGlobalFilter] = useState('');
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [isDragging, setIsDragging] = useState(false);

	const table = useReactTable({
		data: packets,
		columns,
		enableMultiRowSelection: false,
		state: {
			columnFilters,
			globalFilter,
			columnOrder
		},
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onColumnOrderChange: setColumnOrder,
		columnResizeMode: 'onChange',
		defaultColumn: {
			minSize: 100
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});

	const selectedPacket: SerializedPacket | null = useMemo(() => {
		return table.getSelectedRowModel().rows[0]?.original ?? null;
	}, [table.getState().rowSelection]);

	const columnSizeVars = useMemo(() => {
		const headers = table.getFlatHeaders();
		const colSizes: { [key: string]: number } = {};
		for (let i = 0; i < headers.length; i++) {
			const header = headers[i]!;
			colSizes[`--header-${header.id}-size`] = header.getSize();
			colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
		}
		return colSizes;
	}, [table.getState().columnSizingInfo, table.getState().columnSizing]);

	const width = table.getTotalSize();

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event
		if (active && over && active.id !== over.id) {
			setColumnOrder(columnOrder => {
				const oldIndex = columnOrder.indexOf(active.id as string)
				const newIndex = columnOrder.indexOf(over.id as string)
				return arrayMove(columnOrder, oldIndex, newIndex) 
			})
		}
		setIsDragging(false);
	}

	const sensors = useSensors(
		useSensor(MouseSensor, {}),
		useSensor(TouchSensor, {}),
		useSensor(KeyboardSensor, {})
	)

	return (
		<div className="flex flex-col absolute inset-0">
			<div className="flex space-x-2 p-2 border-b-[1px] relative">
				<FilterField onSubmit={setGlobalFilter} onCancel={() => setGlobalFilter('')} initialValue=''/>
				<PacketTableSettings table={table}/>
			</div>
			<ResizablePanelGroup direction="vertical">
				<ResizablePanel className="overflow-auto">
					<ScrollArea className="h-full">
						<DndContext
							collisionDetection={closestCenter}
							modifiers={[restrictToHorizontalAxis]}
							onDragEnd={handleDragEnd}
							onDragStart={() => setIsDragging(true)}
							onDragCancel={() => setIsDragging(false)}
							sensors={sensors}
						>
							<Table style={{...columnSizeVars, width}}>
								<TableHeader>
									{table.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											<SortableContext
												items={columnOrder}
												strategy={horizontalListSortingStrategy}
											>
												{headerGroup.headers.map((header) => {
													return <PacketTableHeader key={header.id} header={header}/>;
												})}
											</SortableContext>
										</TableRow>
									))}
								</TableHeader>
								{table.getState().columnSizingInfo.isResizingColumn || isDragging ? (
									<MemoizedPacketTableBody table={table} columnOrder={columnOrder}/>
								) : (
									<PacketTableBody table={table} columnOrder={columnOrder}/>
								)}
							</Table>
						</DndContext>
						<ScrollBar />
						<ScrollBar orientation="horizontal"/>
					</ScrollArea>
				</ResizablePanel>
				<ResizableHandle />
				<ResizablePanel>
					<PacketInspector packet={selectedPacket} />
				</ResizablePanel>
			</ResizablePanelGroup>
		</div>
	);
}

interface PacketTableBodyProps {
	table: TableDef<SerializedPacket>;
	columnOrder: string[];
}

function PacketTableBody({ table, columnOrder }: PacketTableBodyProps): JSX.Element {
	return <TableBody className="font-mono">
		{table.getRowModel().rows?.length ? (
			table.getRowModel().rows.map((row) => {
				const isError = row.original.stack_trace !== undefined
				return <TableRow
					key={row.id}
					data-state={row.getIsSelected() && 'selected'}
					data-error={isError}
					onClick={() => row.toggleSelected()}
				>
					<SortableContext
						items={columnOrder}
						strategy={horizontalListSortingStrategy}
					>
						{row.getVisibleCells().map((cell) => 
							<PacketTableCell key={cell.id} cell={cell}/>
						)}
					</SortableContext>
				</TableRow>
		})) : (
			<TableRow>
				<TableCell colSpan={table.getVisibleFlatColumns().length} className="h-24 text-center">
					No results.
				</TableCell>
			</TableRow>
		)}
	</TableBody>;
}

const MemoizedPacketTableBody = memo(
	PacketTableBody,
	(prev, next) => prev.table.options.data === next.table.options.data
);

interface ResizableTableHeaderProps<TD, TV> {
	header: Header<TD, TV>;
}

function PacketTableHeader<TD, TV>({ header }: ResizableTableHeaderProps<TD, TV>): JSX.Element {
	const {
		attributes,
		isDragging,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition
	} = useSortable({
		id: header.column.id
	});

	const [dialogOpen, setDialogOpen] = useState(false);

	const headerWidth: CSSProperties = useMemo(() => {
		return {
			width: `calc(var(--header-${header?.id}-size) * 1px)`,
			maxWidth: `calc(var(--header-${header?.id}-size) * 1px)`,
		}
	}, [header]);

	const styles: CSSProperties = useMemo(() => {
		return {
			transform: CSS.Translate.toString(transform),
			transition: transition,
			zIndex: isDragging ? 1 : 0
		}
	}, [transition, transform, isDragging]);

	function submitDialog(value: string): void {
		header.column.setFilterValue(value);
		setDialogOpen(false);
	}

	return <TableHead className="p-0" style={headerWidth}>
		<div className={'flex items-stretch content-center h-full select-none group relative ' + (isDragging ? 'bg-zinc-100 border-x-2' : '')} ref={setNodeRef} style={styles}>
			<div className="grow pl-2" ref={setActivatorNodeRef} {...attributes} {...listeners}>
				<div className="flex items-center h-full">
					<div>
						{header.isPlaceholder
							? null
							: flexRender(
								header.column.columnDef.header,
								header.getContext()
						)}
					</div>
				</div>
			</div>
			{!header.column.getCanFilter()
				? null
				: <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
					<div className="px-2 hover:bg-zinc-200 dark:hover:bg-zinc-800">
						<DialogTrigger asChild>
							<div className="flex items-center h-full">
								<Filter size={16} className={'group-hover:visible ' + (header.column.getIsFiltered() ? '' : 'invisible')} />
							</div>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</DialogTitle>
							<DialogDescription>
								Adjust filter for {flexRender(header.column.columnDef.header, header.getContext())}
							</DialogDescription>
							<FilterField onSubmit={submitDialog} onCancel={() => {}} initialValue={header.column.getFilterValue() as string}></FilterField>
							<DialogFooter>
								<Button onClick={() => submitDialog('')}>
									Clear
								</Button>
							</DialogFooter>
						</DialogContent>
					</div>
				</Dialog>
			}
			<div className="hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-col-resize" onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}>
				<div className="flex items-center h-full">
					<GripVertical size={16} className="invisible group-hover:visible" />
				</div>
			</div>
		</div>
	</TableHead>;
}

interface PacketTableCellProps {
	cell: Cell<SerializedPacket, unknown>;
}

function PacketTableCell({ cell }: PacketTableCellProps): JSX.Element {
	const { isDragging, setNodeRef, transform, transition } = useSortable({
		id: cell.column.id,
	})

	const styles: CSSProperties = useMemo(() => {
		return {
			width: `calc(var(--col-${cell.column?.id}-size) * 1px)`,
			maxWidth: `calc(var(--col-${cell.column?.id}-size) * 1px)`,
			transform: CSS.Translate.toString(transform),
			transition: transition,
			zIndex: isDragging ? 1 : 0
		}
	}, [transform, transition, isDragging]);

	return <TableCell style={styles} ref={setNodeRef} className={'overflow-hidden truncate relative ' + (isDragging ? 'bg-white/80' : '')}>
		{flexRender(cell.column.columnDef.cell, cell.getContext())}
	</TableCell>
}

interface FilterFieldProps {
	onSubmit: (filter: string) => void;
	onCancel: (filter: string) => void;
	initialValue: string;
}

function FilterField({ onSubmit, onCancel, initialValue }: FilterFieldProps): JSX.Element {
	const [filter, setFilter] = useState(initialValue);

	const handleFilterChange = (e: KeyboardEvent): void => {
		if (e.key === 'Enter') {
			return onSubmit(filter);
		}

		if (e.key === 'Escape') {
			return cancel();
		}
	};

	function cancel(): void {
		onCancel(filter);
		setFilter('');
	}

	return <div className="relative flex-auto">
		<Input className="inline-block" placeholder="Filter packets..." value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={handleFilterChange} />
		{filter !== ''
				? <Button variant="ghost" className="inline-block absolute right-0 rounded-l-none px-3" onClick={() => cancel()}>
					<CircleX size={16} />
				</Button>
				: null}
	</div>;
}

interface PacketTableSettingsProps {
    table: TableDef<SerializedPacket>;
}

export function PacketTableSettings({ table }: PacketTableSettingsProps) {
    return <DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button variant="outline" className="px-3">
				<Settings2 size={16} />
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent>
			<DropdownMenuLabel>
				Column visibility
			</DropdownMenuLabel>
			<DropdownMenuSeparator />
			{table.getAllFlatColumns().map(column =>
				<DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={column.toggleVisibility}>
					{column.columnDef?.header?.toString()}
				</DropdownMenuCheckboxItem>
			)}
		</DropdownMenuContent>
	</DropdownMenu>
}