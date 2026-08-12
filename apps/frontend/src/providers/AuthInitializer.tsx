import React, { useEffect } from 'react';
import { Spin } from 'antd';
import { useAuthStore } from '../services/useAuthStore';
import { api } from '../services/api';
import { UserRole, type GetMeResponse } from '@board-bot-arena/shared';

const AuthInitializer: React.FC<{children: React.ReactNode}> = ({ children }: { children: React.ReactNode }) => {
  const { setUser, isInitialized, setIsInitialized } = useAuthStore();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await api.get<GetMeResponse>('/auth/me');
        const userRole = res.data.role as UserRole;
        setUser({
          type: "user",
          userId: res.data.userId,
          name: res.data.username,
          role: userRole,
        });
      } catch {
        setUser(null);
      } finally {
        setIsInitialized(true);
      }
    };

    verifySession();
  }, [setUser, setIsInitialized]);

  if (!isInitialized) {
    return <div className="flex h-screen items-center justify-center"><Spin /></div>;
  }

  return <>{children}</>;
}

export default AuthInitializer;