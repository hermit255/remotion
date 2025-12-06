import {
  staticFile,
} from "remotion";

export const Metan: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  return (
    <img
      src={staticFile("img/characters/metan.png")}
      alt="Metan"
      {...props}
    />
  );
};
