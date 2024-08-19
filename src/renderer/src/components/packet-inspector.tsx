import { Buffer } from 'buffer';
import { useEffect, useMemo, useRef, useState } from "react";
import RMCMessage from "@/nex/rmc-message";
import SerializedPacket from "@/types/nex/serialized-packet";
import { ScrollArea, ScrollBar } from "@renderer/components/ui/scroll-area";
import { ByteView } from "@renderer/components/byte-view";
import { TreeView } from '@renderer/components/tree-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@renderer/components/ui/resizable';
import { Alert, AlertDescription, AlertTitle } from '@renderer/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

interface PacketInspectorProps {
	packet: SerializedPacket | null
}

interface Payload {
	id: string;
	name: string;
	data: number[];
}

export function PacketInspector({ packet }: PacketInspectorProps): JSX.Element {
	if (!packet) {
		return <div></div>;
	}

	const payloads: Payload[] = [];

	if (packet.defragmented_payload) {
		payloads.push({
			id: 'defragmented',
			name: 'Defragmented Payload',
			data: packet.defragmented_payload
		});
	}

	if (packet.decrypted_payload) {
		payloads.push({
			id: 'decrypted',
			name: 'Decrypted Payload',
			data: packet.decrypted_payload
		});
	}

	if (packet.payload && packet.payload.length > 0) {
		payloads.push({
			id: 'encrypted',
			name: 'Encrypted Payload',
			data: packet.payload
		});
	}

	return <ResizablePanelGroup direction={'horizontal'}>
		<ResizablePanel>
			<TreeView key={packet.time} packet={packet} />
		</ResizablePanel>
		{payloads.length > 0 ?
			<>
				<ResizableHandle />
				<ResizablePanel>
					<Tabs key={packet.time} className="h-full flex flex-col" defaultValue={payloads[0]?.id}>
						<TabsList>
							{payloads.map(payload =>
								<TabsTrigger key={payload.id} value={payload.id}>
									{payload.name}
								</TabsTrigger>
							)}
						</TabsList>
						{payloads.map(payload =>
							<TabsContent key={payload.id} value={payload.id} className="grow mt-0">
								<ByteView data={payload.data} />
							</TabsContent>
						)}
					</Tabs>
				</ResizablePanel>
			</> : null
		}
	</ResizablePanelGroup>
}
