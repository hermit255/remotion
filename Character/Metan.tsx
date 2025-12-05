import {
  staticFile,
} from "remotion";

export const Metan: React.FC = ({}) => {
  return (
    <img
      src={staticFile("img/characters/metan.png")}
      alt="Metan"
      style={{
        backgroundColor: "transparent",
        display: "block",
      }}
    />
  );
};
