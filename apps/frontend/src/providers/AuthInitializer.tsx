import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '../services/useAuthStore';
import { api } from '../services/api';
import { type GetMeResponse } from '@board-bot-arena/shared';

const AuthInitializer: React.FC<{children: React.ReactNode}> = ({ children }: { children: React.ReactNode }) => {
  const { setUserId, isInitialized, setIsInitialized } = useAuthStore();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await api.get<GetMeResponse>('/auth/me'); 
        setUserId(response.data.userId);
      } catch {
        setUserId(null);
      } finally {
        setIsInitialized(true);
      }
    };

    verifySession();
  }, [setUserId, setIsInitialized]);

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center"><Spin /></div>;
  }

  return <>{children}</>;
}

export default AuthInitializer;