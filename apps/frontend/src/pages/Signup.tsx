import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Form, Input, Button, message, Breadcrumb } from 'antd';
import { useAuthStore } from '../services/useAuthStore';
import { type ApiErrorResponse, type CreateAccountRequest, type CreateAccountResponse, createAccountSchema } from '@board-bot-arena/shared';
import { api, setAccessToken } from '../services/api';
import { zodRule } from '../utils/zodAdapter';
import axios from 'axios';

const crumbItems = [
  { title: <Link to='/' className='text-gray-200'>Home</Link> },
  { title: 'Sign Up' },
];

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const setUserId = useAuthStore((state) => state.setUserId);
  const [isLoading, setIsLoading] = useState(false);
  
  const [form] = Form.useForm();

  const onSubmit = async (values: CreateAccountRequest) => {
    setIsLoading(true);
    try {
      const validData = createAccountSchema.parse(values);
      const res = await api.post<CreateAccountResponse>('/auth/register', validData, { withCredentials: true });
      setAccessToken(res.data.token);
      setUserId(res.data.userId);
      navigate('/');
    } catch(e) {
      if (axios.isAxiosError<ApiErrorResponse>(e)) {
        const apiError = e.response?.data;
        
        if (apiError) {
          console.error(apiError.error);
          if (apiError.details) {
            console.error("Validation details:\n", apiError.details);
          }
          message.error(apiError.error);
        }
      } else {
        message.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Breadcrumb items={crumbItems} className='absolute top-2 left-3'/>
      <div className="bg-background h-screen flex flex-col items-center justify-center">
        <div className="bg-surface max-w-96 w-[50vw] p-8 rounded-lg shadow-md border border-gray-200">
          <h1 className="text-3xl font-bold text-center mb-6">Sign Up</h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
          >
            <Form.Item
              name="username"
              label="Username"
              tooltip="Username doesn't have to be unique"
              rules={[zodRule(createAccountSchema.shape.username)]}
              required
            >
              <Input placeholder="xXBotSlay3rXx" size='large' />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[zodRule(createAccountSchema.shape.email)]}
              required
            >
              <Input placeholder="example@bot.com" size='large' />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[zodRule(createAccountSchema.shape.password)]}
              required
            >
              <Input.Password placeholder="•••••••••••••••" size='large' />
            </Form.Item>

            <div className="w-full flex mb-2 justify-center gap-0.5 text-md">
              Already have an account? <Link to="/login">Log in</Link>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              disabled={isLoading}
              size='large'
            >
              {isLoading ? 'Creating Account...' : 'Sign up'}
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Signup;