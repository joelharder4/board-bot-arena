import { useEffect, useState } from "react";
import { getMatches } from "../services/matches";
import Navbar from "../components/Navbar";
import { MatchStatus, type Match } from "@board-bot-arena/shared";
import Skeleton from "../components/ui/Skeleton";
import LobbyCard from "../components/ui/LobbyCard";

const Home: React.FC = () => {
  const [matches, setMatches] = useState<Array<Match>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const data = await getMatches({ status: MatchStatus.PENDING, count: 3 });
        setMatches(data);
        console.log(data);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLobbies();
    const intervalId = setInterval(fetchLobbies, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <Navbar/>
      <div className="bg-background h-screen flex flex-col items-center justify-center">
        <div className="bg-surface max-w-2xl w-[60vw] max-h-96 h-[40vw] md:p-6 p-4 rounded-lg shadow-md border border-gray-200 flex flex-row gap-4 items-stretch">
        { isLoading || matches.length >= 1 ? <>
          { isLoading ? <Skeleton className="grow-2 h-full"/> : <LobbyCard lobby={matches[0]} className="grow-2" size="large"/> }
          { matches.length >= 3 && <div className="flex flex-col min-h-30vh h-full grow gap-2">
            { isLoading ? <Skeleton className="w-full h-full"/> : <LobbyCard lobby={matches[1]} className="h-1/2 w-full grow"/> }
            { isLoading ? <Skeleton className="w-full h-full"/> : <LobbyCard lobby={matches[2]} className="h-1/2 w-full grow"/> }
          </div> }
        </> : <>
          loser
        </>
        }
        </div>
      </div>
    </>
  );
}

export default Home;