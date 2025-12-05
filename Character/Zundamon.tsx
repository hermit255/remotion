import {
  staticFile,
} from "remotion";

export const Zundamon: React.FC = ({}) => {
  return (
    <img
      src={staticFile("img/characters/zundamon.png")}
      alt="Zundamon"
      style={{
        backgroundColor: "transparent",
        display: "block",
      }}
    />
  );
};
