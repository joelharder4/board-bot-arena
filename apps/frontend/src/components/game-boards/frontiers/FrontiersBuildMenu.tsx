import { Button } from "antd"
import Icon from '@ant-design/icons';
import SettlementAsset from "./SettlementAsset"
import CityAsset from "./CityAsset";
import RoadAsset from "./RoadAsset";
import { FrontiersCard } from "../../ui/icons/FrontiersCard";
import { useState } from "react";
import { FrontiersCardStack } from "./FrontiersCardStack";
import { Resource } from "@board-bot-arena/shared";

interface FrontiersBuildMenuProps {
  onBuild: (type: string) => void;
}

export const FrontiersBuildMenu = ({ onBuild }: FrontiersBuildMenuProps) => {
  const [hovering, setHovering] = useState<"settlement" | "city" | "road" | "devCard" | null>(null);
  
  return (
    <div className="flex flex-col-reverse h-full items-end p-1 gap-1">
      <span
        className="relative inline-flex items-center"
        onMouseEnter={() => setHovering("city")}
        onMouseLeave={ () => { if (hovering === "city") setHovering(null) } }
      >
        <div className={`absolute right-full mr-1 flex flex-row gap-0.5 transition-all duration-150 pointer-events-none ${hovering === "city" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
          <FrontiersCardStack number={2} resource={Resource.WHEAT} />
          <FrontiersCardStack number={3} resource={Resource.ORE} />
        </div>
        <Button
          type="default"
          size="large"
          icon={ <Icon component={CityAsset} /> }
          onClick={() => onBuild("city")}
        />
      </span>

      <span
        className="relative inline-flex items-center"
        onMouseEnter={() => setHovering("settlement")}
        onMouseLeave={ () => { if (hovering === "settlement") setHovering(null) } }
      >
        <div className={`absolute right-full mr-1 flex flex-row gap-0.5 transition-all duration-150 pointer-events-none ${hovering === "settlement" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
          <FrontiersCardStack number={1} resource={Resource.WOOD} />
          <FrontiersCardStack number={1} resource={Resource.BRICK} />
          <FrontiersCardStack number={1} resource={Resource.SHEEP} />
          <FrontiersCardStack number={1} resource={Resource.WHEAT} />
        </div>
        <Button
          type="default"
          size="large"
          icon={ <Icon component={SettlementAsset} /> }
          onClick={() => onBuild("settlement")}
        />
      </span>

      <span
        className="relative inline-flex items-center"
        onMouseEnter={() => setHovering("road")}
        onMouseLeave={ () => { if (hovering === "road") setHovering(null) } }
      >
        <div className={`absolute right-full mr-1 flex flex-row gap-0.5 transition-all duration-150 pointer-events-none ${hovering === "road" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
          <FrontiersCardStack number={1} resource={Resource.WOOD} />
          <FrontiersCardStack number={1} resource={Resource.BRICK} />
        </div>
        <Button
          type="default"
          size="large"
          icon={ <Icon component={RoadAsset} /> }
          onClick={() => onBuild("road")}
        />
      </span>

      <span
        className="relative inline-flex items-center"
        onMouseEnter={() => setHovering("devCard")}
        onMouseLeave={ () => { if (hovering === "devCard") setHovering(null) } }
      >
        <div className={`absolute right-full mr-1 flex flex-row gap-0.5 transition-all duration-150 pointer-events-none ${hovering === "devCard" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
          <FrontiersCardStack number={1} resource={Resource.ORE} />
          <FrontiersCardStack number={1} resource={Resource.WHEAT} />
          <FrontiersCardStack number={1} resource={Resource.SHEEP} />
        </div>
        <Button
          type="default"
          size="large"
          icon={ <FrontiersCard resource={null} size="tiny" /> }
          onClick={() => onBuild("devCard")}
        />
      </span>
    </div>
  )
}