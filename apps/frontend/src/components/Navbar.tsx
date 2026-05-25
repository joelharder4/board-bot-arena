import { Button } from "antd";
import { useNavigate } from "react-router";
import { useAuthStore } from "../services/useAuthStore";
import { api } from "../services/api";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => !(!state.userId));
  const setUserId = useAuthStore((state) => state.setUserId);

  const onLogIn = () => {
    // check if there is a refresh token we can use
    navigate('/login');
  }

  const onSignUp = () => {
    navigate('/signup');
  }

  const onLogOut = () => {
    api.post('/auth/logout');
    setUserId(null);
  }

  return (
    <div className="w-full mt-0 h-min bg-surface flex flex-row">
      
      <div className="ml-auto mr-4 pt-1 pb-1.5 flex flex-row gap-2">
        {isLoggedIn ? 
          <Button type="primary" onClick={onLogOut}>Log Out</Button> 
          : 
          <>
            <Button type="primary" onClick={onLogIn}>Log in</Button>
            <Button onClick={onSignUp}>Sign up</Button>
          </>
        }
      </div>
    </div>
  )
}

export default Navbar;