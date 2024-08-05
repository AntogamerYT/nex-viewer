import { Packet, PacketTable } from '@/components/packet-table';
import { ThemeProvider } from '@/components/theme-provider';
import { Chrome } from '@/components/ui/chrome';

const data: Packet[] = [
	{
		time: 12,
		source: '192.168.0.10',
		destination: '192.168.0.14',
		version: 'v0',
		info: 'Something'
	},
	{
		time: 22,
		source: '192.168.0.10',
		destination: '192.168.0.14',
		version: 'v0',
		info: 'Something'
	},
	{
		time: 33,
		source: '192.168.0.10',
		destination: '192.168.0.14',
		version: 'v0',
		info: 'Something'
	},
	{
		time: 45,
		source: '192.168.0.10',
		destination: '192.168.0.14',
		version: 'v0',
		info: 'Something'
	},
];

function App(): JSX.Element {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Chrome>
				<div className="p-2">
					<PacketTable packets={data}/>
				</div>
			</Chrome>
		</ThemeProvider>
	);
}

export default App;
