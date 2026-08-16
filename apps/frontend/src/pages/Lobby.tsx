import React, { useState } from "react"
import { useMatchStore } from "../services/useMatchStore";
import { SettingOutlined } from "@ant-design/icons";
import { Alert, Button, Form, InputNumber, message, Select, Switch } from "antd";
import { useForm } from "antd/es/form/Form";
import { useAuthStore } from "../services/useAuthStore";
import { useSocket } from "../providers/useSocket";
import type { StartMatchPayload } from "@board-bot-arena/shared";

const Lobby: React.FC = () => {
  const [form] = useForm();
  const [isLoading, setLoading] = useState<boolean>(false);
  const userId = useAuthStore((state) => state.user?.userId);
  const matchId = useMatchStore((state) => state.matchId);
  const isHost = useMatchStore((state) => {
    const me = state.playerList.find((p) => p.type === "user" && p.userId === userId);
    return me?.type === "user" && me.isHost;
  });
  
  const { socket } = useSocket();

  const startMatch = () => {
    if (!socket || !matchId) return;
    setLoading(true);
    try {
      const payload: StartMatchPayload = { matchId }
      socket.emit('start_game', payload);
    } catch {
      message.error("Failed to start game");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col bg-gray-100 w-full h-full items-center justify-center">
      <div className="max-w-md w-full h-auto bg-white border border-gray-200 rounded-md shadow-md p-6 md:p-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200 shadow-sm">
            <SettingOutlined className="text-2xl text-gray-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 m-0 leading-none">Match Settings</h2>
        </div>

        {!isHost && (
          <Alert
            title="Only the lobby host can modify the match settings."
            type="info"
            showIcon
          />
        )}

        <Form form={form} layout="vertical" disabled={!isHost || isLoading} initialValues={{ vp: 10, map: 'random' }} onSubmitCapture={startMatch}>
          
          <div className="grid grid-cols-2 gap-4 mt-3">
            <Form.Item
              label={<span className="font-bold">Victory Points</span>}
              name="vp"
            >
              <InputNumber
                mode="spinner"
                min={1}
                max={13} // This is the max possible to avoid softlock on default map
              />
            </Form.Item>

            <Form.Item label={<span className="font-bold">Map Generation</span>} name="map">
              <Select options={[
                { label: "Randomized", value: "random" },
                { label: "Tournament Fixed", value: "fixed" }
              ]}/>
            </Form.Item>

            <Form.Item label={<span className="font-bold text-gray-700">Fast Turn Timer (60s)</span>} name="fastTimer" valuePropName="checked" className="m-0">
              <Switch />
            </Form.Item>
          </div>

          <div className="pt-2">
            <Button
              type={isHost ? "primary" : "default"}
              htmlType="submit"
              size="large"
              block
              disabled={!isHost || isLoading}
              className="font-bold h-12 text-base shadow-sm"
            >
              {isHost ? "Start Game" : "Waiting for Host..."}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Lobby;