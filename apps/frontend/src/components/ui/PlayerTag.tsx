
interface PlayerTagProps {
  text: string;
  classes?: string;
}

const PlayerTag: React.FC<PlayerTagProps> = ({text, classes}: PlayerTagProps) => {
  const colourClasses = classes ?? "bg-indigo-200 text-indigo-800";

  return (
    <span className={`px-1.5 py-1 text-[10px] leading-none rounded-xs uppercase ${colourClasses}`}>
      {text}
    </span>
  );
}

export default PlayerTag;