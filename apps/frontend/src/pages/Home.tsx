import { useEffect, useState } from "react";
import { getMatches } from "../services/matches";
import Navbar from "../components/Navbar";
import { MatchStatus, type Match } from "@board-bot-arena/shared";
import Skeleton from "../components/ui/Skeleton";

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
        <div className="bg-surface max-w-2xl w-[50vw] max-h-96 h-[30vw] md:p-8 p-2 rounded-lg shadow-md border border-gray-200 flex flex-row gap-4 items-stretch">
          { isLoading ? <Skeleton className="grow-2 h-full"/> :
            <div>

            </div>
          }
          <div className="flex flex-col min-h-30vh h-full grow gap-2">
            { isLoading ? <Skeleton className="w-full h-full"/> : <></> }
            { isLoading ? <Skeleton className="w-full h-full"/> : <></> }
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;