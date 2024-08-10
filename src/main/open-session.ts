import Session from '@/nex/session';
import { BrowserWindow } from 'electron';

export function openSession(window: BrowserWindow, filePath: string): void {
	const session = new Session();

	window.webContents.send('open-session');

	session.on('packet', packet => {
		window.webContents.send('packet', packet.toJSON());
	});

	session.on('finished', _ => {
		window.webContents.send('session-loaded');
	});

	session.parse(filePath);
}