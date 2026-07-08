import { Download } from "lucide-react";
import { ImageService } from "../services/image-service";
import { useChart } from "./chord/useChart";
import { GA } from "../services/google-analytics";
import { T } from "@magic-translate/react";
import { Button } from "@/components/ui/button";

const downloadPng =
  (chartDom: HTMLDivElement | null, width: number, title?: string) => () => {
    if (!chartDom || !chartDom.firstChild) {
      return;
    }

    GA()?.("event", "image_download", {
      value: width,
    });

    const svg = chartDom.firstChild as SVGElement;
    ImageService.downloadPng(svg, width, title);
  };

const downloadSvg = (chartDom: HTMLDivElement | null, title?: string) => () => {
  if (!chartDom) {
    return;
  }

  const svg = chartDom.innerHTML;
  ImageService.downloadSvg(svg, title);
};

interface IProps {
  title?: string;
}

// size multipliers (1 => original size)
const pngSizeMultipliers: { multiplier: number; name: string }[] = [
  {
    multiplier: 0.5,
    name: "Small",
  },
  {
    multiplier: 1,
    name: "Medium",
  },
  {
    multiplier: 2,
    name: "Large",
  },
  {
    multiplier: 4,
    name: "Huge",
  },
];

export const DownloadButtons = ({ title }: IProps) => {
  const { ref, size } = useChart();

  return (
    <div className="mt-8" id="download">
      <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight">
        <T>Download</T>
      </h2>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={downloadSvg(ref.current, title)}>
          <Download />
          SVG
        </Button>

        {pngSizeMultipliers.map(({ multiplier, name }) => {
          const width = Math.round(size.width * multiplier);
          const height = Math.round(size.height * multiplier);

          return (
            <Button
              variant="outline"
              key={multiplier}
              onClick={downloadPng(ref.current, width, title)}
            >
              <Download />
              <span>
                <T>{name} PNG</T> ({width} x {height})
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
