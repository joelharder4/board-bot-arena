import { PlusOutlined } from '@ant-design/icons'; // Or lucide-react icon
import { Button } from 'antd';
import type React from 'react';

interface EmptyLobbyStateProps {
  onCreateLobby: () => void;
}

export const EmptyLobbyState: React.FC<EmptyLobbyStateProps> = ({ onCreateLobby }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full">
      <div className="w-32 h-32 mb-2 text-gray-200">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Hexagon */}
          <polygon 
            points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" 
            className="stroke-gray-200 fill-gray-50" 
            strokeWidth="3" 
            strokeLinejoin="round" 
          />
          
          {/* Left Eye (Settlement) */}
          <g className="fill-gray-300">
            <polygon points="30,35 35,30 40,35 40,42 30,42" />
          </g>

          {/* Right Eye (City) */}
          <g className="fill-gray-300">
            <polygon points="57,42 57,35 65,35 65,30 69,26 73,30 73,42" />
          </g>

          {/* Frown */}
          <g className="stroke-gray-300" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <line x1="35" y1="70" x2="45" y2="60" />
            <line x1="45" y1="60" x2="55" y2="60" />
            <line x1="55" y1="60" x2="65" y2="70" />
          </g>
        </svg>
      </div>

      <div className="text-gray-400 text-sm mb-6 text-center">
        <span className="block text-gray-500 font-medium text-base mb-1">
          No matches found
        </span>
        The frontier is currently empty.
      </div>

      <Button
        variant="solid"
        color="geekblue"
        size="large"
        className="mb-2"
        onClick={onCreateLobby}
      >
        <PlusOutlined />
        Create Lobby
      </Button>
    </div>
  );
};