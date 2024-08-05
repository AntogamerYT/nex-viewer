import { Moon, Sun } from 'lucide-react';
import { Theme, useTheme } from '@/components/theme-provider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function ModeToggle(): JSX.Element {
	const { setTheme, theme } = useTheme();

	return (
		<ToggleGroup size="sm" type="single" value={theme} onValueChange={(value) => setTheme(value as Theme)}>
			<ToggleGroupItem value="light"><Sun size={18}/></ToggleGroupItem>
			<ToggleGroupItem value="dark"><Moon size={18}/></ToggleGroupItem>
			<ToggleGroupItem value="system">System</ToggleGroupItem>
		</ToggleGroup>
	);
}
