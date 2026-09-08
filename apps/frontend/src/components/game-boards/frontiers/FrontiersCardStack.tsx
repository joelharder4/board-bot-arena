import type { Resource } from "@board-bot-arena/shared";
import { FrontiersCard } from "../../ui/icons/FrontiersCard";

interface FrontiersCardStackProps {
  number: number;
  resource: Resource;
}

export const FrontiersCardStack = ({number, resource}: FrontiersCardStackProps) => {
  if (number === 0) return <></>;

  if (number <= 3) return (
    <div className={`flex flex-row ${number === 2 && "ml-1 mr-1"} ${number === 3 && "ml-2 mr-2"}`}>
      {Array(number).fill(null).map(() => <FrontiersCard resource={resource as Resource} size="small" className="-ml-8 first:m-0 shadow-sm"/> )}
    </div>
  );

  if (number > 3) return (
    <div key={resource} className="relative">
      <FrontiersCard resource={resource as Resource} size="small" className="shadow-sm" />
      <span className="absolute -top-1.5 -right-2 bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg border border-white z-10 shadow-sm leading-none">
        x{number}
      </span>
    </div>
  );
}