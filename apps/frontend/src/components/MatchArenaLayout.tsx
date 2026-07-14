import { Outlet } from "react-router";
import { useSocket } from "../providers/useSocket";
import { Button } from "antd";

export default function MatchArenaLayout() {
    const { isConnected } = useSocket();

    const onLeaveMatch = () => {
        
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-white">
            <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <h1 className="text-xl font-bold">Boardgame Bot Arena</h1>
                <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
                    <Button danger type="primary">Leave Match</Button>
                </div>
            </header>

            <main className="grow flex overflow-hidden">
                <div className="grow p-4 relative">
                    <Outlet /> 
                </div>

                <aside className="w-80 border-l border-gray-700 bg-gray-800">
                    <div className="p-4">Chat will go here</div>
                </aside>
            </main>
        </div>
    );
}