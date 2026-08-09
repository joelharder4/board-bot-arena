import React from "react"
import { useMatchStore } from "../services/useMatchStore";
import { SettingOutlined } from "@ant-design/icons";
import { Alert, Button, Form, InputNumber, Select, Switch } from "antd";
import { useForm } from "antd/es/form/Form";

const MatchLobby: React.FC = () => {
  const [form] = useForm();
  const isHost = useMatchStore((state) => {
    const me = state.playerList.find((p) => p.playerId === state.playerId);
    return me?.isHost;
  });

  // const onInputVP = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const num = parseInt(e.target.value)
  //   return isNaN(num) ? "" : num;
  // }

  return (
    <div className="flex flex-col bg-gray-100 w-full h-full items-center justify-center">
      <div className="max-w-md w-full h-auto bg-white border border-gray-200 rounded-md shadow-md p-6 md:p-8 flex flex-col items-center">
        <div className="flex items-center gap-3">
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

        <Form form={form} layout="vertical" disabled={!isHost} initialValues={{ vp: 10, map: 'random' }}>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
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

          {/* <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex justify-between items-center shadow-sm">
            <span className="font-bold text-gray-700">Fast Turn Timer (60s)</span>
            <Form.Item name="fastTimer" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div> */}

          <div className="pt-2">
            <Button
              type={isHost ? "primary" : "default"}
              size="large"
              block // Antd prop to make the button take 100% width
              disabled={!isHost}
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

export default MatchLobby;