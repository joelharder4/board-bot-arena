import { useEffect, useState } from "react";
import { getMatches } from "../services/matches";
import Navbar from "../components/Navbar";
import { MatchStatus, type CreateMatchRequest, type CreateMatchResponse, type Match } from "@board-bot-arena/shared";
import Skeleton from "../components/ui/Skeleton";
import LobbyCard from "../components/ui/LobbyCard";
import { Button, message } from "antd";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useMatchStore } from "../services/useMatchStore";

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Array<Match>>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const setMatchId = useMatchStore((state) => state.setMatchId);
  const setPlayerId = useMatchStore((state) => state.setPlayerId);
  const clearMatch = useMatchStore((state) => state.clearMatch);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const data = await getMatches({ status: MatchStatus.PENDING, count: 3 });
        setMatches(data);
      } finally {
        setIsFetching(false);
      }
    }

    fetchLobbies();
    const intervalId = setInterval(fetchLobbies, 5000);
    return () => clearInterval(intervalId);
  }, []);


  const onCreateMatch = async (inviteOnly: boolean) => {
    setIsLoading(true);
    try {
      const payload: CreateMatchRequest = {
        gameId: 1,
        private: inviteOnly
      };
      const res = await api.post<CreateMatchResponse>('/matches/create', payload);
      setMatchId(res.data.matchId);
      setPlayerId(res.data.playerId);
      navigate(`/match/${res.data.matchId}`);
    } catch (err) {
      clearMatch();
      console.error('Error creating a match:\n', err);
      message.error('Failed to Create Lobby');
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      <Navbar/>
      <div className="bg-background h-screen flex flex-col items-center justify-center">
        <div className="bg-surface max-w-2xl w-[60vw] max-h-96 h-[40vw] md:p-6 p-4 rounded-lg shadow-md border border-gray-200 flex flex-row gap-4 items-stretch">
        { isFetching || matches.length >= 1 ? <>
          { isFetching ? <Skeleton className="grow-2 h-full"/> : <LobbyCard lobby={matches[0]} className="grow-2" size="large"/> }
          { matches.length >= 3 && <div className="flex flex-col min-h-30vh h-full grow gap-2">
            { isFetching ? <Skeleton className="w-full h-full"/> : <LobbyCard lobby={matches[1]} className="h-1/2 w-full grow"/> }
            { isFetching ? <Skeleton className="w-full h-full"/> : <LobbyCard lobby={matches[2]} className="h-1/2 w-full grow"/> }
          </div> }
        </> : <>
          no lobbies lmao
        </>
        }
        </div>
        
        <div className="flex flex-row max-w-2xl w-[60vw] m-2">
          <Button
            type="primary"
            size="large"
            onClick={() => setIsPrivate(!isPrivate)}
            disabled={isLoading}
            className="w-20"
            style={{borderBottomRightRadius: "0px", borderTopRightRadius: "0px"}}
          >
            {isPrivate ? "Private" : "Public"}
          </Button>
          <Button
            type="default"
            size="large"
            onClick={() => onCreateMatch(isPrivate)}
            disabled={isLoading}
            className="grow-3"
            style={{borderBottomLeftRadius: "0px", borderTopLeftRadius: "0px"}}
          >
            Create Lobby
          </Button>
          <Button
            type="default"
            size="large"
            // onClick={onOpenJoinCode}
            disabled={isLoading}
            className="grow-3 ml-2"
          >
            Join Lobby
          </Button>
        </div>
      </div>
    </>
  );
}

export default Home;