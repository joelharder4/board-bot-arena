import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './components/NotFound';
import Signup from './pages/Signup';
import { SocketProvider } from './providers/SocketProvider';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },

  {
    path: '/match/:matchId',
    element: (
      <SocketProvider>
        <></>
      </SocketProvider>
    ),
    children: [],
  },

  { path: '*', element: <NotFound />},
]);