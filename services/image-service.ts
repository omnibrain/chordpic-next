import dayjs from 'dayjs'
import { saveSvgAsPng } from 'save-svg-as-png'

const FILENAME_DATE_FORMAT = 'YYYY-MM-DD-mm-ss'

export class ImageService {
  static async downloadPng(svg: SVGElement, width: number, name?: string) {
    // Unfortunately saveSvgAsPng does not allow to just set a height and width and scale the
    // image to that size. The workaround: Determine the the size that saveSvgAsPng uses by
    // default (viewBox times 2) and then size the image by setting a scale that scales the
    // image to the wanted size. A bit hacky, but works like charm.
    const [, , viewBoxWidth] = svg!.getAttribute('viewBox')!.split(/\s+|,/).map(Number)

    saveSvgAsPng(svg, ImageService.fileName(name, 'png'), {
      scale: width / (viewBoxWidth * 2),
      // increase PNG quality
      encoderOptions: 0.9
    })
  }

  static downloadSvg(svgString: string, name?: string) {
    // / Create a fake <a> element
    const fakeLink = document.createElement('a')

    // hack to trigger the download
    fakeLink.setAttribute('href', `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`)
    fakeLink.setAttribute('download', ImageService.fileName(name, 'svg'))
    fakeLink.click()
  }

  static fileName(name: string | undefined, extension: string) {
    return name ? name.replace(/[^0-9a-z\s]/gi, '').replace(' ', '-') : `chart-${dayjs().format(FILENAME_DATE_FORMAT)}.${extension}`
  }
}
