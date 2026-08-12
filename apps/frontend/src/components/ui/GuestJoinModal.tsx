import { Button, Divider, Form, Input, message, Modal } from "antd";
import { ArrowRightOutlined, LoginOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { type CreateGuestResponse, type CreateGuestRequest, createGuestSchema } from "@board-bot-arena/shared";
import { api, setAccessToken } from "../../services/api";
import { useAuthStore } from "../../services/useAuthStore";
import { zodRule } from "../../utils/zodAdapter";


interface GuestJoinModalProps {
  matchId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onGuestSuccess: () => void;
}

export const GuestJoinModal: React.FC<GuestJoinModalProps> = ({
  matchId,
  isOpen,
  onClose,
  onGuestSuccess,
}) => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = React.useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      form.setFieldsValue({ name: `Guest_${randomNum}` });
    }
  }, [isOpen, form]);


  const handlePlayAsGuest = async (values: CreateGuestRequest) => {
    if (!matchId) return;
    setIsLoading(true);

    try {
      const guestResponse = await api.post<CreateGuestResponse>('/auth/guest', values);

      setUser(guestResponse.data.user);
      setAccessToken(guestResponse.data.token);

      onGuestSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to join as guest:", error);
      message.error("Failed to join lobby");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="text-xl font-bold text-gray-800">Join Match</span>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
      styles={{
        header: { marginBottom: 24 },
        body: { paddingBottom: 8 },
      }}
    >
      <div className="flex flex-col">
        <Form 
          form={form} 
          onFinish={(values) => handlePlayAsGuest(values)}
          layout="vertical"
        >
          <Form.Item 
            name="name" 
            rules={[zodRule(createGuestSchema.shape.name)]}
            className="mb-4"
          >
            <Input 
              size="large" 
              prefix={<UserOutlined className="text-gray-400 mr-1" />}
              placeholder="Enter a nickname..." 
              className="py-2 text-lg"
              autoFocus
            />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            size="large" 
            loading={isLoading}
            icon={<ArrowRightOutlined />}
            iconPlacement="end"
            className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-500 shadow-md"
          >
            Play as Guest
          </Button>
        </Form>

        <Divider className="my-5 text-gray-400 border-gray-200">
          <span className="text-sm font-medium">OR</span>
        </Divider>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="large" 
            icon={<LoginOutlined />}
            className="w-full text-gray-700 hover:text-blue-600 hover:border-blue-600"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
          <Button 
            size="large" 
            icon={<UserAddOutlined />}
            className="w-full text-gray-700 hover:text-blue-600 hover:border-blue-600"
            onClick={() => navigate('signup')}
          >
            Sign Up
          </Button>
        </div>
        
        <p className="mt-5 text-xs text-center text-gray-400">
          Guests cannot save match history or upload custom bots.
        </p>
      </div>
    </Modal>
  );
};