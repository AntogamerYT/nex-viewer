import { App, dialog, Menu, MenuItemConstructorOptions } from 'electron';
import { openSession } from '@/main/open-session';

export function createMenu(app: App): Menu {
	const isMac = process.platform === 'darwin';

	const template: MenuItemConstructorOptions[] = [];

	if (isMac) {
		template.push({
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideOthers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' }
			]
		});
	}

	template.push({
		label: 'File',
		submenu: [
			{
				label: 'Open session',
				click: async (_, window): Promise<void> => {
					if (!window) {
						return;
					}

					const result = await dialog.showOpenDialog(window, {
						filters: [{
							name: 'Packet captures',
							extensions: ['pcap', 'pcapng']
						}]
					});

					if (!result.canceled) {
						openSession(window, result.filePaths[0]);
					}
				}
			},
			{ type: 'separator' },
			isMac ? { role: 'close' } : { role: 'quit' }
		]
	});

	return Menu.buildFromTemplate(template);
}