import dayjs from "dayjs";
// @ts-ignore
import { saveSvgAsPng } from "save-svg-as-png";
import sanitize from "sanitize-filename";

const FILENAME_DATE_FORMAT = "YYYY-MM-DD-mm-ss";

export class ImageService {
  static async downloadPng(svg: SVGElement, width: number, name?: string) {
    // Unfortunately saveSvgAsPng does not allow to just set a height and width and scale the
    // image to that size. The workaround: Determine the the size that saveSvgAsPng uses by
    // default (viewBox times 2) and then size the image by setting a scale that scales the
    // image to the wanted size. A bit hacky, but works like charm.
    const [, , viewBoxWidth] = svg!
      .getAttribute("viewBox")!
      .split(/\s+|,/)
      .map(Number);

    saveSvgAsPng(svg, ImageService.fileName(name, "png"), {
      scale: width / (viewBoxWidth * 2),
      // increase PNG quality
      encoderOptions: 0.9,
    });
  }

  static downloadSvg(svgString: string, name?: string) {
    // iOS Safari ignores downloads of data: URLs and of links that aren't in the document
    const url = URL.createObjectURL(
      new Blob([svgString], { type: "image/svg+xml" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = ImageService.fileName(name, "svg");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }

  static fileName(name: string | undefined, extension: string) {
    return name
      ? `${sanitize(name)}.${extension}`
      : `chart-${dayjs().format(FILENAME_DATE_FORMAT)}.${extension}`;
  }
}
