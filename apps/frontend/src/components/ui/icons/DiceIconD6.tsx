import type { HTMLAttributes } from "react";
import { GiInvertedDice1, GiInvertedDice2, GiInvertedDice3, GiInvertedDice4, GiInvertedDice5, GiInvertedDice6 } from "react-icons/gi";

interface DiceIconD6Props {
  value: number;
  className?: HTMLAttributes<HTMLElement>['className'];
}

export const DiceIconD6 = ({ value, className }: DiceIconD6Props) => {
  switch(value) {
    case 1: return <GiInvertedDice1 className={className} />;
    case 2: return <GiInvertedDice2 className={className} />;
    case 3: return <GiInvertedDice3 className={className} />;
    case 4: return <GiInvertedDice4 className={className} />;
    case 5: return <GiInvertedDice5 className={className} />;
    case 6: return <GiInvertedDice6 className={className} />;
    default: return <></>;
  }
}