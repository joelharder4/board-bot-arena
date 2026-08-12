import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Input, Button, message, Breadcrumb } from 'antd';
import { useAuthStore } from '../services/useAuthStore';
import { type LogInRequest, type LogInResponse, logInSchema } from '@board-bot-arena/shared';
import { api, setAccessToken } from '../services/api';
import { zodRule } from '../utils/zodAdapter';

const crumbItems = [
  { title: <Link to='/' className='text-gray-200'>Home</Link> },
  { title: 'Log In' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form] = Form.useForm();

  const onSubmit = async (values: LogInRequest) => {
    setIsLoading(true);
    try {
      const validData = logInSchema.parse(values);
      const res = await api.post<LogInResponse>('/auth/login', validData);
      setAccessToken(res.data.token);
      setUser(res.data.user);
      navigate('/');
    } catch {
      message.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Breadcrumb items={crumbItems} className='absolute top-2 left-3'/>
      <div className="bg-background h-screen flex flex-col items-center justify-center">
        <div className="bg-surface max-w-96 w-[50vw] p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold text-center mb-6">Log in</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[zodRule(logInSchema.shape.email)]}
            >
              <Input placeholder="" size='large' />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[zodRule(logInSchema.shape.password)]}
            >
              <Input.Password placeholder="" size='large' />
            </Form.Item>

            <div className="w-full flex flex-row-reverse mb-2">
              <Link to="/signup">Create an Account</Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isLoading}
              size='large'
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Login;