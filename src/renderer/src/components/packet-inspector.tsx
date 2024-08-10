import { Buffer } from 'buffer';
import { useState } from "react";
import RMCMessage from "@/nex/rmc-message";
import SerializedPacket from "@/types/nex/serialized-packet";
import { ScrollArea, ScrollBar } from "@renderer/components/ui/scroll-area";
import { ByteView } from "@renderer/components/byte-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs';

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

    if (packet.payload) {
        payloads.push({
            id: 'encrypted',
            name: 'Encrypted Payload',
            data: packet.payload
        });
    }

    return <div className="h-full flex items-stretch">
        <div className="grow overflow-hidden">
            <ScrollArea className="h-full">
                <pre>
                    {JSON.stringify(packet.message, null, 2)}
                </pre>
                <ScrollBar />
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
        <Tabs className="flex flex-col border-l-[1px]">
            <TabsList defaultValue={payloads[0].id}>
                {payloads.map(payload =>
                    <TabsTrigger key={payload.id} value={payload.id}>
                        {payload.name}
                    </TabsTrigger>
                )}
            </TabsList>
            {payloads.map(payload =>
                <TabsContent key={payload.id} value={payload.id} className="grow mt-0">
                    <ByteView data={payload.data} className="h-full"/>
                </TabsContent>
            )}
        </Tabs>
    </div>
}