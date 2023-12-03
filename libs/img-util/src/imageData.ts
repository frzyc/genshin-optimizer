export function cropCanvas(
  srcCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = w
  canvas.height = h
  ctx.drawImage(srcCanvas, x, y, w, h, 0, 0, w, h)
  return canvas
}

export function cropImageData(
  srcCanvas: HTMLCanvasElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ctx = srcCanvas.getContext('2d', { willReadFrequently: true })!
  return ctx.getImageData(x, y, w, h)
}
export function cropVertical(
  srcCanvas: HTMLCanvasElement,
  x1: number,
  x2: number
) {
  return cropImageData(srcCanvas, x1, 0, x2 - x1, srcCanvas.height)
}
export function cropHorizontal(
  srcCanvas: HTMLCanvasElement,
  y1: number,
  y2: number
) {
  if (y1 === y2) {
    console.warn(`trying to crop with y1:${y1} y2:${y2}. Crop aborted.`)
    return cropImageData(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height)
  }

  return cropImageData(srcCanvas, 0, y1, srcCanvas.width, y2 - y1)
}

export const fileToURL = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = ({ target }) => resolve(target!.result as string)
    reader.readAsDataURL(file)
  })
export const urlToImageData = (urlFile: string): Promise<ImageData> =>
  new Promise((resolve) => {
    const img = new Image()
    img.onload = ({ target }) =>
      resolve(imageToImageData(target as HTMLImageElement))
    img.src = urlFile
  })

function imageToImageData(image: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0, image.width, image.height)
  return ctx.getImageData(0, 0, image.width, image.height)
}

export function imageDataToCanvas(imageData: ImageData): HTMLCanvasElement {
  // create off-screen canvas element
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  // update canvas with new data
  canvas.getContext('2d')!.putImageData(imageData, 0, 0)
  return canvas // produces a PNG file
}
