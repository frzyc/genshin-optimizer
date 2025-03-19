import { within } from '@genshin-optimizer/common/util'
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
  return Array.from({ length: hori ? width : height }, (_, i) => {
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

  return Array.from({ length: max }, (_, i) => {
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
  let a = Number.NEGATIVE_INFINITY
  for (let i = 0; i < length; i++) {
    const maxed = histogram[i] > hMax
    if (!maxed) a = Number.NEGATIVE_INFINITY
    else if (maxed && a < 0) a = i
    else if (maxed && i - a >= window) break
  }
  if (a < 0) a = 0

  let b = Number.POSITIVE_INFINITY
  for (let i = length - 1; i >= 0; i--) {
    const maxed = histogram[i] > hMax
    if (!maxed) b = Number.POSITIVE_INFINITY
    else if (maxed && b > length - 1) b = i
    else if (maxed && b - i >= window) break
  }
  if (b > length - 1) b = length - 1
  return [a, b]
}

/**
 * This function performs standard image preprocessing. Standard blur,
 * dilate, invert and threshold is done consecutively.
 * @param pixelData imagedata
 * @returns a preprocessed cloned image
 */
export function preprocessImage(pixelData: ImageData) {
  const imageClone = Uint8ClampedArray.from(pixelData.data)
  blurARGB(imageClone, pixelData.width, pixelData.height, 0.5)
  dilate(imageClone, pixelData.width)
  invertColors(imageClone)
  thresholdFilter(imageClone, 0.4)
  return new ImageData(imageClone, pixelData.width, pixelData.height)
}

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
export function thresholdFilter(pixels: Uint8ClampedArray, level: number) {
  if (level === undefined) {
    level = 0.5
  }
  const thresh = Math.floor(level * 255)
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
    let val: number
    if (gray >= thresh) {
      val = 255
    } else {
      val = 0
    }
    pixels[i] = pixels[i + 1] = pixels[i + 2] = val
  }
}
// from https://css-tricks.com/manipulating-pixels-using-canvas/
export function invertColors(pixels: Uint8ClampedArray) {
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = pixels[i] ^ 255 // Invert Red
    pixels[i + 1] = pixels[i + 1] ^ 255 // Invert Green
    pixels[i + 2] = pixels[i + 2] ^ 255 // Invert Blue
  }
}

// internal kernel stuff for the gaussian blur filter
let blurRadius: number
let blurKernelSize: number
let blurKernel: Int32Array
let blurMult: Array<Int32Array>

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
function buildBlurKernel(r: number) {
  let radius = (r * 3.5) | 0
  radius = radius < 1 ? 1 : radius < 248 ? radius : 248

  if (blurRadius !== radius) {
    blurRadius = radius
    blurKernelSize = (1 + blurRadius) << 1
    blurKernel = new Int32Array(blurKernelSize)
    blurMult = new Array(blurKernelSize)
    for (let l = 0; l < blurKernelSize; l++) {
      blurMult[l] = new Int32Array(256)
    }

    let bki: number
    let bm: Int32Array, bmi: Int32Array

    for (let i = 1, radiusi = radius - 1; i < radius; i++) {
      blurKernel[radius + i] = blurKernel[radiusi] = bki = radiusi * radiusi
      bm = blurMult[radius + i]
      bmi = blurMult[radiusi--]
      for (let j = 0; j < 256; j++) {
        bm[j] = bmi[j] = bki * j
      }
    }
    const bk = (blurKernel[radius] = radius * radius)
    bm = blurMult[radius]

    for (let k = 0; k < 256; k++) {
      bm[k] = bk * k
    }
  }
}

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
function blurARGB(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
) {
  const numPackedPixels = width * height
  const argb = new Int32Array(numPackedPixels)
  for (let j = 0; j < numPackedPixels; j++) {
    argb[j] = getARGB(pixels, j)
  }
  let sum: number, cr: number, cg: number, cb: number, ca: number
  let read: number, ri: number, ym: number, ymi: number, bk0: number
  const a2 = new Int32Array(numPackedPixels)
  const r2 = new Int32Array(numPackedPixels)
  const g2 = new Int32Array(numPackedPixels)
  const b2 = new Int32Array(numPackedPixels)
  let yi = 0
  buildBlurKernel(radius)
  let x: number, y: number, i: number
  let bm: Int32Array
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      cb = cg = cr = ca = sum = 0
      read = x - blurRadius
      if (read < 0) {
        bk0 = -read
        read = 0
      } else {
        if (read >= width) {
          break
        }
        bk0 = 0
      }
      for (i = bk0; i < blurKernelSize; i++) {
        if (read >= width) {
          break
        }
        const c = argb[read + yi]
        bm = blurMult[i]
        ca += bm[(c & -16777216) >>> 24]
        cr += bm[(c & 16711680) >> 16]
        cg += bm[(c & 65280) >> 8]
        cb += bm[c & 255]
        sum += blurKernel[i]
        read++
      }
      ri = yi + x
      a2[ri] = ca / sum
      r2[ri] = cr / sum
      g2[ri] = cg / sum
      b2[ri] = cb / sum
    }
    yi += width
  }
  yi = 0
  ym = -blurRadius
  ymi = ym * width
  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      cb = cg = cr = ca = sum = 0
      if (ym < 0) {
        bk0 = ri = -ym
        read = x
      } else {
        if (ym >= height) {
          break
        }
        bk0 = 0
        ri = ym
        read = x + ymi
      }
      for (i = bk0; i < blurKernelSize; i++) {
        if (ri >= height) {
          break
        }
        bm = blurMult[i]
        ca += bm[a2[read]]
        cr += bm[r2[read]]
        cg += bm[g2[read]]
        cb += bm[b2[read]]
        sum += blurKernel[i]
        ri++
        read += width
      }
      argb[x + yi] =
        ((ca / sum) << 24) | ((cr / sum) << 16) | ((cg / sum) << 8) | (cb / sum)
    }
    yi += width
    ymi += width
    ym++
  }
  setPixels(pixels, argb)
}

function getARGB(data: Uint8ClampedArray, i: number) {
  const offset = i * 4
  return (
    ((data[offset + 3] << 24) & 0xff000000) |
    ((data[offset] << 16) & 0x00ff0000) |
    ((data[offset + 1] << 8) & 0x0000ff00) |
    (data[offset + 2] & 0x000000ff)
  )
}

function setPixels(pixels: Uint8ClampedArray, data: Int32Array) {
  let offset = 0
  for (let i = 0, al = pixels.length; i < al; i++) {
    offset = i * 4
    pixels[offset + 0] = (data[i] & 0x00ff0000) >>> 16
    pixels[offset + 1] = (data[i] & 0x0000ff00) >>> 8
    pixels[offset + 2] = data[i] & 0x000000ff
    pixels[offset + 3] = (data[i] & 0xff000000) >>> 24
  }
}

// from https://github.com/processing/p5.js/blob/main/src/image/filters.js
function dilate(pixels: Uint8ClampedArray, width: number) {
  let currIdx = 0
  const maxIdx = pixels.length ? pixels.length / 4 : 0
  const out = new Int32Array(maxIdx)
  let currRowIdx: number,
    maxRowIdx: number,
    colOrig: number,
    colOut: number,
    currLum: number

  let idxRight: number, idxLeft: number, idxUp: number, idxDown: number
  let colRight: number, colLeft: number, colUp: number, colDown: number
  let lumRight: number, lumLeft: number, lumUp: number, lumDown: number

  while (currIdx < maxIdx) {
    currRowIdx = currIdx
    maxRowIdx = currIdx + width
    while (currIdx < maxRowIdx) {
      colOrig = colOut = getARGB(pixels, currIdx)
      idxLeft = currIdx - 1
      idxRight = currIdx + 1
      idxUp = currIdx - width
      idxDown = currIdx + width

      if (idxLeft < currRowIdx) {
        idxLeft = currIdx
      }
      if (idxRight >= maxRowIdx) {
        idxRight = currIdx
      }
      if (idxUp < 0) {
        idxUp = 0
      }
      if (idxDown >= maxIdx) {
        idxDown = currIdx
      }
      colUp = getARGB(pixels, idxUp)
      colLeft = getARGB(pixels, idxLeft)
      colDown = getARGB(pixels, idxDown)
      colRight = getARGB(pixels, idxRight)

      //compute luminance
      currLum =
        77 * ((colOrig >> 16) & 0xff) +
        151 * ((colOrig >> 8) & 0xff) +
        28 * (colOrig & 0xff)
      lumLeft =
        77 * ((colLeft >> 16) & 0xff) +
        151 * ((colLeft >> 8) & 0xff) +
        28 * (colLeft & 0xff)
      lumRight =
        77 * ((colRight >> 16) & 0xff) +
        151 * ((colRight >> 8) & 0xff) +
        28 * (colRight & 0xff)
      lumUp =
        77 * ((colUp >> 16) & 0xff) +
        151 * ((colUp >> 8) & 0xff) +
        28 * (colUp & 0xff)
      lumDown =
        77 * ((colDown >> 16) & 0xff) +
        151 * ((colDown >> 8) & 0xff) +
        28 * (colDown & 0xff)

      if (lumLeft > currLum) {
        colOut = colLeft
        currLum = lumLeft
      }
      if (lumRight > currLum) {
        colOut = colRight
        currLum = lumRight
      }
      if (lumUp > currLum) {
        colOut = colUp
        currLum = lumUp
      }
      if (lumDown > currLum) {
        colOut = colDown
        currLum = lumDown
      }
      out[currIdx++] = colOut
    }
  }
  setPixels(pixels, out)
}
