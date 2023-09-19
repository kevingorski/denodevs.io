import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";
import type { JSX } from "preact";
import { decodeBlurHash } from "npm:fast-blurhash";

type Props =
  & JSX.HTMLAttributes<HTMLImageElement>
  & {
    blurhash: string;
    srcset?: string;
    src: string;
    height: number;
    width: number;
  };

export default function (props: Props) {
  const { blurhash, onLoad, style, ...imageProps } = props;
  const hasLoadedImage = useSignal(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sizeStyle =
    `height:${imageProps.height}px;width:${imageProps.width}px;`;
  const containerStyle = `display:inline-block;${style}${sizeStyle}`;
  const canvasStyle = `${sizeStyle}${
    hasLoadedImage.value ? "display:none;" : ""
  }`;
  const imageContainerStyle = hasLoadedImage.value ? "" : "display:none;";

  useEffect(() => {
    const image = new Image(imageProps.width, imageProps.height);
    image.onload = handleImageLoad;
    if (imageProps.srcset) {
      image.srcset = imageProps.srcset;
    } else {
      image.src = imageProps.src;
    }

    if (canvasRef.current === null) {
      throw new Error("canvas is null");
    }
    const ctx = canvasRef.current.getContext("2d");
    if (ctx === null) {
      throw new Error("canvas context is null");
    }
    const pixels = decodeBlurHash(
      blurhash,
      imageProps.width,
      imageProps.height,
    );
    const imageData = new ImageData(
      pixels,
      imageProps.width,
      imageProps.height,
    );
    ctx.putImageData(imageData, 0, 0);
  });

  function handleImageLoad(
    event: Event,
  ) {
    if (hasLoadedImage.value) {
      return;
    }
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      hasLoadedImage.value = true;
    }
  }

  return (
    <div style={containerStyle}>
      <canvas
        ref={canvasRef}
        style={canvasStyle}
        height={imageProps.height}
        width={imageProps.width}
      />
      <div style={imageContainerStyle}>
        <img
          {...imageProps}
        />
      </div>
    </div>
  );
}
