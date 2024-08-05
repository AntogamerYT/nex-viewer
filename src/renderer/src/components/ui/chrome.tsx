import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Menubar, MenubarContent, MenubarItem, MenubarLabel, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Copy, Minus, X } from 'lucide-react';
import { PropsWithChildren } from 'react';

const ipc = window.electron.ipcRenderer;

export function Chrome({ children }: PropsWithChildren<object>): JSX.Element {
	return (
		<>
			<div className="flex draggable-chrome border-b-2">
				<Menubar className="flex-auto">
					<MenubarMenu>
						<MenubarTrigger className="non-draggable-chrome">File</MenubarTrigger>
						<MenubarContent>
							<MenubarItem>
								Load Session
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger className="non-draggable-chrome">Settings</MenubarTrigger>
						<MenubarContent>
							<MenubarLabel>Theme</MenubarLabel>
							<MenubarItem>
								<ModeToggle />
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
				<div className="flex-none non-draggable-chrome">
					<Button variant="ghost" className="p-y-0 border-0 rounded-none cursor-pointer" onClick={() => { ipc.send('minimize'); }}>
						<Minus size={16} />
					</Button>
					<Button variant="ghost" className="p-y-0 border-0 rounded-none cursor-pointer" onClick={() => { ipc.send('maximize'); }}>
						<Copy size={16} />
					</Button>
					<Button variant="ghost" className="p-y-0 border-0 rounded-none cursor-pointer" onClick={() => { ipc.send('close'); }}>
						<X size={16} />
					</Button>
				</div>
			</div>
			{children}
		</>
	);
}
