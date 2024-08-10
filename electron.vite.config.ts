import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	main: {
		resolve: {
			alias: {
				'@': resolve(__dirname, './src')
			}
		},
		plugins: [externalizeDepsPlugin()]
	},
	preload: {
		plugins: [externalizeDepsPlugin()]
	},
	renderer: {
		resolve: {
			alias: {
				'@renderer': resolve(__dirname, './src/renderer/src'),
				'@': resolve(__dirname, './src')
			}
		},
		plugins: [react()]
	}
});
