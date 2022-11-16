import { DownloadIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import { ImageService } from "../services/image-service";
import { useChart } from "./chord/useChart";

const downloadPng =
  (chartDom: HTMLDivElement | null, width: number, title?: string) => () => {
    if (!chartDom || !chartDom.firstChild) {
      return;
    }

    gtag?.("event", "image_download", {
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
    <Box mt={8} id="download">
      <Heading as="h2" size="lg" mb={3}>
        Download
      </Heading>
      <Flex gap={3} wrap="wrap">
        <Button
          variant="outline"
          display="flex"
          gap={2}
          onClick={downloadSvg(ref.current, title)}
        >
          <DownloadIcon />
          SVG
        </Button>

        {pngSizeMultipliers.map(({ multiplier, name }) => {
          const width = Math.round(size.width * multiplier);
          const height = Math.round(size.height * multiplier);

          return (
            <Button
              variant="outline"
              display="flex"
              gap={2}
              key={multiplier}
              onClick={downloadPng(ref.current, width, title)}
            >
              <DownloadIcon />
              {name} PNG ({width} x {height})
            </Button>
          );
        })}
      </Flex>
    </Box>
  );
};
