import {
  staticFile,
} from "remotion";

export const Zundamon: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  return (
    <img
      src={staticFile("img/characters/zundamon.webp")}
      alt="Zundamon"
      {...props}
    />
  );
};
