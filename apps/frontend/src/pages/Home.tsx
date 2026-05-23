import Navbar from "../components/Navbar";

const Home: React.FC = () => {
  return (
    <>
      <Navbar/>
      <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-4">
      
        <div className="flex justify-between items-center text-foreground">
          <h3 className="font-bold text-lg">Loser</h3>
          <span className="text-sm font-medium">Win Rate: 6769%</span>
        </div>

        {/* 10% - Primary color reserved strictly for the Call to Action */}
        <button className="bg-primary hover:bg-primary-dark text-surface font-semibold py-2 px-4 rounded transition-colors duration-200">
          Run Match
        </button>

      </div>
    </>
  );
}

export default Home;