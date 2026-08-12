import { Button, Dropdown, type MenuProps } from "antd";
import { Link, useNavigate } from "react-router";
import { useAuthStore } from "../services/useAuthStore";
import { api } from "../services/api";
import { UserRole } from "@board-bot-arena/shared";
import { CodeOutlined, LoginOutlined, LogoutOutlined, RobotOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const onLogOut = () => {
    api.post('/auth/logout');
    setUser(null);
  }

  const guestMenu: MenuProps['items'] = [
    { key: 'signup', icon: <UserAddOutlined />, label: 'Create Account', onClick: () => navigate('/signup') },
    { key: 'login', icon: <LoginOutlined />, label: 'Log In', onClick: () => navigate('/login') },
    { type: 'divider' },
    { key: 'leave', danger: true, icon: <LogoutOutlined />, label: 'Leave Guest Session', onClick: onLogOut },
  ];

  const userMenu: MenuProps['items'] = [
    { key: 'profile', icon: <UserOutlined />, label: 'My Profile', onClick: () => navigate('/profile') },
    { type: 'divider' },
    { key: 'logout', danger: true, icon: <LogoutOutlined />, label: 'Log Out', onClick: onLogOut },
  ];

  return (
    <div className="fixed w-full mt-0 z-50 h-14 bg-white flex items-center justify-between px-6 border-b border-gray-200 shadow-sm">
      
      <div className="flex items-center gap-8">
        <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          Boardgame Bot Arena
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/" className="hover:text-blue-600">Lobbies</Link>
          <Link to="/bots" className="hover:text-blue-600 flex items-center gap-1"><RobotOutlined /> Bots</Link>
          <Link to="/docs" className="hover:text-blue-600 flex items-center gap-1"><CodeOutlined /> API Docs</Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        
        {!user && (
          <>
            <Button  onClick={() => navigate('/login')}>Log In</Button>
            <Button type="primary" onClick={() => navigate('/signup')}>Sign Up</Button>
          </>
        )}

        {user?.role === UserRole.GUEST && (
          <Dropdown menu={{ items: guestMenu }} trigger={['click']} placement="bottomRight">
            <Button className="flex items-center gap-2 border-dashed border-gray-300">
              <span className="text-gray-500 italic">{user.name}</span>
            </Button>
          </Dropdown>
        )}

        {user?.role !== UserRole.GUEST && user?.role !== undefined && (
          <Dropdown menu={{ items: userMenu }} trigger={['click']} placement="bottomRight">
            <Button type="text" className="flex items-center gap-2 hover:bg-gray-100">
              <UserOutlined />
              <span className="font-semibold text-gray-700">{user.name}</span>
            </Button>
          </Dropdown>
        )}

      </div>
    </div>
  );
}

export default Navbar;