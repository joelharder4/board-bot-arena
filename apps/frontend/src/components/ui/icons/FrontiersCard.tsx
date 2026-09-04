import type { HTMLAttributes } from "react";
import { FrontiersResourceIcon } from "./FrontiersResourceIcon";
import { Resource } from "@board-bot-arena/shared";


const getCardColour = (resource: Resource | null) => {
  switch (resource) {
    case Resource.WOOD: return 'text-green-900 bg-radial from-emerald-500 to-emerald-600';
    case Resource.BRICK: return 'text-red-100 bg-radial from-red-700 to-red-800';
    case Resource.SHEEP: return 'text-lime-800 bg-radial from-lime-400 to-lime-500';
    case Resource.WHEAT: return 'text-orange-900 bg-radial from-yellow-400 to-yellow-500';
    case Resource.ORE: return 'text-gray-600 bg-radial from-gray-300 to-gray-400';
    default: return 'text-blue-800 bg-radial from-cyan-400 to-blue-400';
  }
};

interface FrontiersCardProps {
  resource: Resource | null;
  size?: "tiny" | "small" | "large";
  className?: HTMLAttributes<HTMLElement>['className'];
}

export const FrontiersCard = ({resource, size, className}: FrontiersCardProps) => {

  const background = getCardColour(resource);
  const iconSize = size === "tiny" ? "text-xs" :
                   size === "small" ? "text-lg" :
                   "text-2xl";
  const padding = size === "tiny" ? "px-px py-1.5" :
                  size === "small" ? "px-1 py-2.5" :
                  "px-1.5 py-3.5";
  const corners = size === "tiny" ? "rounded-xs" : "rounded-sm";

  return (
    <div className={`${padding} ${corners} border border-gray-600 shadow-card ${background} ${className}`}>
      <FrontiersResourceIcon resource={resource} className={`${iconSize}`} />
    </div>
  );
}