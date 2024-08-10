import { useEffect, useState } from "react";
import SerializedPacket from "@/types/nex/serialized-packet";
import { PacketTable } from "@renderer/components/packet-table";

const ipc = window.electron.ipcRenderer

enum SessionState {
    Loading,
    Loaded
}

export function Session(): JSX.Element {
    const [state, setState] = useState<SessionState | null>(null);
    const [packets, setPackets] = useState<SerializedPacket[]>([]);

    useEffect(() => {
        const packets: SerializedPacket[] = [];

        const startHandler = ipc.on('open-session', () => {
            setState(SessionState.Loading);
        });

        const packetHandler = ipc.on('packet', (_, packet: SerializedPacket) => {
            packets.push(packet);
        });

        const finishedHandler = ipc.on('session-loaded', () => {
            setPackets(packets);
            setState(SessionState.Loaded);
        });

        return () => {
            startHandler();
            packetHandler();
            finishedHandler();
        };
    }, [packets]);

    switch (state) {
        case SessionState.Loading:
            return <div>Loading</div>;
        case SessionState.Loaded:
            return <PacketTable packets={packets} />
        default:
            return <div>Sploosh</div>;

    }
}