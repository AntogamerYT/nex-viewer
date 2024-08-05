import { ColumnDef, flexRender, getCoreRowModel, Header, useReactTable, Table as TableDef, getFilteredRowModel } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CircleX, GripVertical } from 'lucide-react';
import React, { KeyboardEvent, useState } from 'react';

export interface Packet {
	time: number;
	source: string;
	destination: string;
	version: string;
	info: string;
}

interface PacketTableProps {
	packets: Packet[];
}

const columns: ColumnDef<Packet>[] = [
	{
		accessorKey: 'time',
		header: 'Time',
		size: 100
	},
	{
		accessorKey: 'source',
		header: 'Source'
	},
	{
		accessorKey: 'destination',
		header: 'Destination'
	},
	{
		accessorKey: 'version',
		header: 'Version',
		size: 100
	},
	{
		accessorKey: 'info',
		header: 'Info'
	}
];

export function PacketTable({ packets: data }: PacketTableProps): JSX.Element {
	const [filter, setFilter] = useState('');

	const table = useReactTable({
		data,
		columns,
		state: {
			globalFilter: filter
		},
		onGlobalFilterChange: setFilter,
		columnResizeMode: 'onChange',
		defaultColumn: {
			minSize: 20,
			maxSize: 1024
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});

	return (
		<div className="flex flex-col space-y-2">
		   	<div className="flex space-x-2">
				<FilterField onSubmit={setFilter} />
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline">
							Columns
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						{
							table.getAllFlatColumns().map(column => {
								return <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onClick={column.getToggleVisibilityHandler()}>
									{column.columnDef.header?.toString()}
								</DropdownMenuCheckboxItem>;
							})
						}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								return <ResizableTableHeader header={header}/>;
							})}
						</TableRow>
					))}
				</TableHeader>
				{table.getState().columnSizingInfo.isResizingColumn ? (
					<MemoizedPacketTableBody table={table} />
				) : (
					<PacketTableBody table={table} />
				)}

			</Table>
		</div>
	);
}

interface PacketTableBodyProps {
	table: TableDef<Packet>;
}

function PacketTableBody({ table }: PacketTableBodyProps): JSX.Element {
	return <TableBody>
		{table.getRowModel().rows?.length ? (
			table.getRowModel().rows.map((row) => (
				<TableRow
					key={row.id}
					data-state={row.getIsSelected() && 'selected'}
				>
					{row.getVisibleCells().map((cell) => (
						<TableCell key={cell.id}>
							{flexRender(cell.column.columnDef.cell, cell.getContext())}
						</TableCell>
					))}
				</TableRow>
			))
		) : (
			<TableRow>
				<TableCell colSpan={columns.length} className="h-24 text-center">
					No results.
				</TableCell>
			</TableRow>
		)}
	</TableBody>;
}

const MemoizedPacketTableBody = React.memo(
	PacketTableBody,
	(prev, next) => prev.table.options.data === next.table.options.data
);

interface ResizableTableHeaderProps<TD, TV> {
	header: Header<TD, TV>;
}

function ResizableTableHeader<TD, TV>({ header }: ResizableTableHeaderProps<TD, TV>): JSX.Element {
	const [showResizeHandle, setShowResizeHandle] = useState(false);
	const size = header.column.getIsLastColumn() ? null : {
		style: {
			width: header.getSize()
		}
	};

	return <TableHead key={header.id} className="pr-0" {...size} onMouseOver={() => setShowResizeHandle(true)} onMouseOut={() => setShowResizeHandle(false)}>
		<div className="flex items-stretch h-full select-none">
			<div className="flex-auto self-center">
				{header.isPlaceholder
					? null
					: flexRender(
						header.column.columnDef.header,
						header.getContext()
					)}
			</div>
			{!header.column.getIsLastColumn()
				? <div className="flex-none hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:cursor-col-resize" onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()}>
					<div className="flex items-center h-full">
						<GripVertical size={16} {...{ className: showResizeHandle ? '' : 'invisible' }} />
					</div>
				</div>
				: null
			}
		</div>
	</TableHead>;
}

interface FilterFieldProps {
	onSubmit: (filter: string) => void
}

function FilterField({ onSubmit }: FilterFieldProps): JSX.Element {

	const [filter, setFilter] = useState('');

	const handleFilterChange = (e: KeyboardEvent): void => {
		if (e.key === 'Enter') {
			onSubmit(filter);
		}
	};

	const clearFilter = (): void => {
		setFilter('');
		onSubmit('');
	};

	return <div className="relative flex-auto">
		<Input className="inline-block" placeholder="Filter packets..." value={filter} onChange={(e) => setFilter(e.target.value)} onKeyDown={handleFilterChange} />
		{
			filter !== ''
				? <Button variant="ghost" className="inline-block absolute right-0 rounded-l-none px-3" onClick={clearFilter}>
					<CircleX size={16} />
				</Button>
				: null
		}
	</div>;
}