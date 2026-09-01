import { Resource } from "@board-bot-arena/shared";
import type { HTMLAttributes } from "react";
import { GiSheep, GiPineTree, GiBrickPile, GiWheat, GiStonePile } from "react-icons/gi";

interface FrontiersResourceIconProps {
  resource: Resource;
  className?: HTMLAttributes<HTMLElement>['className'];
}

export const FrontiersResourceIcon = ({ resource, className }: FrontiersResourceIconProps) => {
  switch (resource) {
    case Resource.WOOD: return <GiPineTree className={className}/>;
    case Resource.SHEEP: return <GiSheep className={className}/>;
    case Resource.BRICK: return <GiBrickPile className={className}/>;
    case Resource.WHEAT: return <GiWheat className={className}/>;
    case Resource.ORE: return <GiStonePile className={className}/>;
    default: <></>;
  }
}