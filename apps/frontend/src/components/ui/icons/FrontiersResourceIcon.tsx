import { Resource } from "@board-bot-arena/shared";
import type { HTMLAttributes } from "react";
import { GiSheep, GiPineTree, GiClayBrick, GiWheat, GiStonePile } from "react-icons/gi";
import { AiOutlineQuestion } from "react-icons/ai";

interface FrontiersResourceIconProps {
  resource: Resource | null;
  className?: HTMLAttributes<HTMLElement>['className'];
}

export const FrontiersResourceIcon = ({ resource, className }: FrontiersResourceIconProps) => {
  switch (resource) {
    case Resource.WOOD: return <GiPineTree className={className}/>;
    case Resource.SHEEP: return <GiSheep className={className}/>;
    case Resource.BRICK: return <GiClayBrick className={className}/>;
    case Resource.WHEAT: return <GiWheat className={className}/>;
    case Resource.ORE: return <GiStonePile className={className}/>;
    default: return <AiOutlineQuestion className={className}/>;
  }
}