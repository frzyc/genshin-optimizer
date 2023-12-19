import { within } from '@genshin-optimizer/util'
import type { Color } from './color'
import { colorWithin } from './color'

export function bandPass(
  pixelData: ImageData,
  color1: Color,
  color2: Color,
  mode = 'color' as 'bw' | 'color' | 'invert'
) {
  const d = Uint8ClampedArray.from(pixelData.data)

  const bw = mode === 'bw',
    invert = mode === 'invert'
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i],
      g = d[i + 1],
      b = d[i + 2]
    if (colorWithin({ r, g, b }, color1, color2)) {
      if (bw) d[i] = d[i + 1] = d[i + 2] = 0
      else if (invert) {
        d[i] = 255 - r
        d[i + 1] = 255 - g
        d[i + 2] = 255 - b
      } // else orignal color
    } else {
      d[i] = d[i + 1] = d[i + 2] = 255
    }
  }
  return new ImageData(d, pixelData.width, pixelData.height)
}

export function histogramAnalysis(
  imageData: ImageData,
  color1: Color,
  color2: Color,
  hori = true
): number[] {
  const height = imageData.height
  const width = imageData.width
  const p = imageData.data
  return Array.from({ length: hori ? width : height }, (v, i) => {
    let num = 0
    for (let j = 0; j < (hori ? height : width); j++) {
      const pixelIndex = hori
        ? getPixelIndex(i, j, width)
        : getPixelIndex(j, i, width)
      const [r, g, b] = [p[pixelIndex], p[pixelIndex + 1], p[pixelIndex + 2]]
      if (colorWithin({ r, g, b }, color1, color2)) num++
    }
    return num
  })
}

// find the longest "line" in an axis.
export function histogramContAnalysis(
  imageData: ImageData,
  color1: Color,
  color2: Color,
  hori = true,
  range = [0, 1]
): number[] {
  const height = imageData.height
  const width = imageData.width
  const p = imageData.data
  const max = hori ? width : height
  const [leftRange, rightRange] = range
  const left = max * leftRange
  const right = max * rightRange

  return Array.from({ length: max }, (v, i) => {
    if (i < left || i > right) return 0
    let longest = 0
    let num = 0
    for (let j = 0; j < (hori ? height : width); j++) {
      const pixelIndex = hori
        ? getPixelIndex(i, j, width)
        : getPixelIndex(j, i, width)
      const [r, g, b] = [p[pixelIndex], p[pixelIndex + 1], p[pixelIndex + 2]]
      if (
        within(r, color1.r, color2.r) &&
        within(g, color1.g, color2.g) &&
        within(b, color1.b, color2.b)
      )
        num++
      else {
        if (num > longest) longest = num
        num = 0
      }
    }
    if (num > longest) longest = num
    return longest
  })
}

export function getPixelIndex(x: number, y: number, width: number) {
  return y * (width * 4) + x * 4
}

// find the left most and right most peak of the histogram
export function findHistogramRange(
  histogram: number[],
  threshold = 0.7,
  window = 3
) {
  const max = Math.max(...histogram)
  const hMax = max * threshold
  const length = histogram.length
  let a = -window
  for (let i = 0; i < length; i++) {
    const maxed = histogram[i] > hMax
    if (!maxed) a = -window
    else if (maxed && a < 0) a = i
    else if (maxed && i - a > window) break
  }
  if (a < 0) a = 0

  let b = length - 1 + window
  for (let i = length - 1; i >= 0; i--) {
    const maxed = histogram[i] > hMax
    if (!maxed) b = length - 1 + window
    else if (maxed && b > length - 1) b = i
    else if (maxed && b - i > window) break
  }
  if (b > length - 1) b = length - 1
  return [a, b]
}
