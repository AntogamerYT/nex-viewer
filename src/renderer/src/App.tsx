import { ThemeProvider } from '@renderer/components/theme-provider';
import { Session } from '@renderer/components/session';

function App(): JSX.Element {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Session/>
		</ThemeProvider>
	);
}

export default App;
