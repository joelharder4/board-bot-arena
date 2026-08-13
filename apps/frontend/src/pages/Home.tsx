import { useEffect, useState } from "react";
import { getMatches, joinMatch } from "../services/matches";
import Navbar from "../components/Navbar";
import { JOIN_CODE_LENGTH, MatchStatus, type CreateMatchRequest, type CreateMatchResponse, type Match } from "@board-bot-arena/shared";
import Skeleton from "../components/ui/Skeleton";
import LobbyCard from "../components/ui/LobbyCard";
import { Button, ConfigProvider, Input, message, Radio } from "antd";
import { useNavigate } from "react-router";
import { api } from "../services/api";
import { useMatchStore } from "../services/useMatchStore";
import { AxiosError } from "axios";
import { EmptyLobbyState } from "../components/ui/EmptyLobbyState";
import { GuestJoinModal } from "../components/ui/GuestJoinModal";
import { useAuthStore } from "../services/useAuthStore";

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Array<Match>>([]);
  const [joinCode, setJoinCode] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isGuestModalOpen, setGuestModalOpen] = useState(false);
  const userId = useAuthStore((state) => state.user?.userId);
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
      if (err instanceof AxiosError && err.status === 401) message.error('You need to sign in to create a lobby');
      else message.error('Failed to Create Lobby');
    } finally {
      setIsLoading(false);
    }
  }


  const executeJoin = async () => {
    
    setIsLoading(true);
    try {
      const res = await joinMatch({ joinCode: joinCode });
      if (!res.matchId) throw new Error("Did not receive matchId from the server");

      setMatchId(res.matchId);
      setPlayerId(res.playerId);
      navigate(`/match/${res.matchId}`);
    } catch {
      clearMatch();
      message.error("Failed to join lobby");
    } finally {
      setJoinCode("");
      setIsLoading(false);
    }
  }

  const onTryJoin = () => {
    if (joinCode.length !== JOIN_CODE_LENGTH) {
      message.warning("Invalid Join Code");
      return;
    }

    if (!userId) {
      setGuestModalOpen(true);
    } else {
      executeJoin();
    }
  };


  return (
    <>
      <Navbar />
      <div className="bg-background min-h-screen flex flex-col items-center justify-center pt-16 lg:pt-0">
        <div className="max-w-5xl w-[80vw] lg:w-[70vw] mx-auto space-y-6">
          <div className="flex flex-row p-2 gap-2 bg-surface rounded-lg shadow-md border border-gray-200">
            <ConfigProvider
              theme={{
                components: {
                  Radio: {
                    colorPrimary: '#999999',
                    colorPrimaryHover: '#7a7a7a',
                    colorPrimaryActive: '#545454',
                  },
                },
              }}
            >
              <Radio.Group
                block
                options={[
                  { label: 'Public', value: 'public' },
                  { label: 'Private', value: 'private' },
                ]}
                defaultValue="public"
                optionType="button"
                buttonStyle="solid"
                disabled={isLoading}
                onChange={(e) => setIsPrivate(e.target.value === 'private')}
                className="self-center"
              />
            </ConfigProvider>
            <Button
              type="primary"
              onClick={() => onCreateMatch(isPrivate)}
              disabled={isLoading}
            >
              Create Lobby
            </Button>

            <div className="w-64 ml-auto flex flex-row gap-2">
              <ConfigProvider
                theme={{
                  components: {
                    Button: {
                      colorPrimary: '#364153',
                      colorPrimaryHover: '#7a7a7a',
                      colorPrimaryActive: '#545454',
                    },
                  },
                }}
              >
                <Input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.trim().toUpperCase())}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      onTryJoin();
                    }
                  }}
                  placeholder="Enter Join Code..."
                  maxLength={JOIN_CODE_LENGTH}
                />

                <GuestJoinModal 
                  isOpen={isGuestModalOpen}
                  onClose={() => setGuestModalOpen(false)}
                  joinCode={joinCode}
                  onGuestSuccess={() => {
                    executeJoin();
                  }}
                />

                <Button
                  type="primary"
                  onClick={onTryJoin}
                  disabled={isLoading}
                >
                  Join Match
                </Button>
              </ConfigProvider>
            </div>
          </div>

          {
            !isFetching && matches.length === 0 ?
            <div className="w-full flex justify-center">
              <EmptyLobbyState onCreateLobby={() => onCreateMatch(isPrivate)}/>
            </div>
             :
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-[240px]">
              <div className="col-span-1 row-span-1 lg:col-span-2 lg:row-span-2">
                { isFetching ? <Skeleton className="w-full h-full"/> : 
                  matches.length >= 1 &&
                    <LobbyCard lobby={matches[0]} size="large"/> }
              </div>
              <div className="col-span-1 row-span-1">
                { isFetching ? <Skeleton className="w-full h-full"/> : 
                  matches.length < 2 ? <></> :
                    <LobbyCard lobby={matches[1]}/> }
              </div>
              <div className="col-span-1 row-span-1">
                { isFetching ? <Skeleton className="w-full h-full"/> : 
                  matches.length < 3 ? <></> :
                    <LobbyCard lobby={matches[2]}/> }
              </div>
            </div>
          }
        </div>
      </div>
    </>
  );
}

export default Home;