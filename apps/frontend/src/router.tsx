import { createBrowserRouter } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './components/NotFound';
import Signup from './pages/Signup';
import { SocketProvider } from './providers/SocketProvider';
import MatchArenaLayout from './components/MatchArenaLayout';
import MatchLobby from './pages/MatchLobby';

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },

  {
    path: '/match/:matchId',
    element: (
      <SocketProvider>
        <MatchArenaLayout />
      </SocketProvider>
    ),
    children: [
      { index: true, element: <MatchLobby /> },
      { path: 'play', element: <p>in the game</p> },
    ],
  },

  { path: '*', element: <NotFound />},
]);