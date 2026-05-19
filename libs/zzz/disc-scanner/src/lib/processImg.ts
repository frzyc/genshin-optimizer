import {
  crop,
  darkerColor,
  drawHistogram,
  fileToURL,
  findHistogramRange,
  histogramContAnalysis,
  imageDataToCanvas,
  invertColors,
  lighterColor,
  thresholdFilter,
  urlToImageData,
} from '@genshin-optimizer/common/img-util'
import type { Color } from '@genshin-optimizer/common/img-util'
import { clamp, levenshteinDistance } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { discSlotToMainStatKeys } from '@genshin-optimizer/zzz/consts'
import type { IDisc } from '@genshin-optimizer/zzz/zood'
import type { ReactNode } from 'react'
import { cardFillColor, greyBorderColor } from './consts'
import { statMapEngMap } from './enStringMap'
import {
  parseLvlRarity,
  parseMainStatKeys,
  parseSet,
  parseSetSlot,
  parseSubstats,
} from './parse'

export type OcrBox = {
  x: number
  y: number
  width: number
  height: number
}

export type OcrWordBox = OcrBox & {
  text: string
}

export type OcrTextLine = OcrBox & {
  text: string
  words: OcrWordBox[]
}

export type Processed = {
  fileName: string
  imageURL: string
  imageWidth: number
  imageHeight: number
  ocrLines: OcrTextLine[]
  disc?: IDisc
  texts: ReactNode[]
  debugImgs?: Record<string, string> | undefined
}
export type Outstanding = {
  f: File
  fName: string
}

// since ZZZ discs have relatively high contrast, only invert and threshold is needed.
export function zzzPreprocessImage(pixelData: ImageData) {
  const imageClone = Uint8ClampedArray.from(pixelData.data)
  invertColors(imageClone)
  thresholdFilter(imageClone, 0.5)
  return new ImageData(imageClone, pixelData.width, pixelData.height)
}

export async function processEntry(
  entry: Outstanding,
  linesFromImage: (
    imageData: ImageData,
    options?: object | undefined
  ) => Promise<OcrTextLine[]>,
  debug = false
): Promise<Processed> {
  const { f, fName } = entry
  const imageURL = await fileToURL(f)
  const imageData = await urlToImageData(imageURL)

  const debugImgs = debug ? ({} as Record<string, string>) : undefined
  const discCardImageData = cropDiscCard(imageData, debugImgs)

  const retProcessed: Processed = {
    fileName: fName,
    imageURL: imageDataToCanvas(discCardImageData).toDataURL(),
    imageWidth: discCardImageData.width,
    imageHeight: discCardImageData.height,
    ocrLines: [],
    texts: [],
    debugImgs,
  }

  const bwHeader = zzzPreprocessImage(discCardImageData)

  if (debugImgs) {
    debugImgs['bwHeader'] = imageDataToCanvas(bwHeader).toDataURL()
  }

  const ocrLines = await linesFromImage(bwHeader)
  retProcessed.ocrLines = ocrLines
  const whiteTexts = ocrLines.map((line) => line.text)
  const mainStatTextIndex = whiteTexts.findIndex(
    (t) => levenshteinDistance(t.toLowerCase(), 'main stat') < 2
  )
  const substatTextIndex = whiteTexts.findIndex(
    (t) => levenshteinDistance(t.toLowerCase(), 'sub-stats') < 2
  )
  let setEffectTextIndex = whiteTexts.findIndex(
    (t) => levenshteinDistance(t.toLowerCase(), 'set effect') < 2
  )
  if (setEffectTextIndex === -1) setEffectTextIndex = whiteTexts.length - 1

  if (mainStatTextIndex === -1 || substatTextIndex === -1) {
    retProcessed.texts.push(
      'Could not detect main stat, substats or set effect.'
    )
    return retProcessed
  }
  const setLvlTexts = whiteTexts.slice(0, mainStatTextIndex)
  const mainStatTexts = whiteTexts.slice(
    mainStatTextIndex + 1,
    substatTextIndex
  )
  const substatTexts = whiteTexts.slice(
    substatTextIndex + 1,
    setEffectTextIndex
  )
  const setEffectTexts = whiteTexts.slice(setEffectTextIndex + 1)
  if (
    setLvlTexts.length === 0 ||
    mainStatTexts.length === 0 ||
    substatTexts.length === 0
  ) {
    retProcessed.texts.push(
      'Could not detect main stat, substats or set effect.'
    )
    return retProcessed
  }

  // Join all text above the "Main Stat" text due to set text wrapping
  let { slotKey, setKey } = parseSetSlot([setLvlTexts.join('')])
  if (!setKey) {
    if (setEffectTexts.length) setKey = parseSet(setEffectTexts)
    if (!setKey) {
      setKey = 'AstralVoice'
      retProcessed.texts.push(
        'Could not detect set key. Assuming Astral Voice.'
      )
    }
  }
  let { level, rarity } = parseLvlRarity(setLvlTexts)
  if (!rarity || !level) {
    retProcessed.texts.push(
      'Could not detect rarity + level, assuming S Lv.15/15'
    )
    rarity = 'S'
    level = 15
  }
  let mainStatKey = parseMainStatKeys(mainStatTexts, slotKey)
  if (!mainStatKey) {
    mainStatKey = discSlotToMainStatKeys[slotKey!][0]
    retProcessed.texts.push(
      `Could not detect main stat key, defaulting to ${statMapEngMap[mainStatKey]}`
    )
  } else if (!slotKey && mainStatKey) {
    slotKey = Object.entries(discSlotToMainStatKeys).find(([_, v]) =>
      v.includes(mainStatKey as any)
    )?.[0] as DiscSlotKey
    if (slotKey)
      retProcessed.texts.push(
        `Could not detect slot key. inferring it to be ${slotKey}.`
      )
  }
  if (!slotKey) {
    slotKey = '1'
    retProcessed.texts.push('Could not detect slot key. assuming it to be 1.')
  }
  const substats = parseSubstats(substatTexts)
  const disc: IDisc = {
    setKey,
    slotKey: slotKey!,
    level,
    rarity,
    mainStatKey,
    location: '',
    lock: false,
    trash: false,
    substats,
  }
  retProcessed.disc = disc
  return retProcessed
}
function greyBorderHistogram(imageData: ImageData, horizontal: boolean) {
  // Row scan: ignore top nav + bottom chrome. Column scan: ignore far-left disc list.
  const range = horizontal ? [0.12, 0.98] : [0.07, 0.93]
  return histogramContAnalysis(
    imageData,
    darkerColor(greyBorderColor, 20),
    lighterColor(greyBorderColor, 20),
    horizontal,
    range
  )
}

function drawCropMark(
  canvas: HTMLCanvasElement,
  pos: number,
  color: Color,
  horizontal: boolean,
  thickness = 3
) {
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${
    color.a ? color.a / 255 : 1
  })`
  const half = Math.floor(thickness / 2)
  if (horizontal) {
    ctx.fillRect(0, pos - half, canvas.width, thickness)
  } else {
    ctx.fillRect(pos - half, 0, thickness, canvas.height)
  }
  return canvas
}

function cardFillHistogram(imageData: ImageData, horizontal: boolean) {
  return histogramContAnalysis(
    imageData,
    darkerColor(cardFillColor, 12),
    lighterColor(cardFillColor, 18),
    horizontal
  )
}

/** Rows where the longest grey run spans most of the width (top/bottom card border). */
function cardTopBottomBorderRowHistogram(imageData: ImageData) {
  const { width, height } = imageData
  const raw = greyBorderHistogram(imageData, false)
  const minRun = Math.floor(width * 0.22)
  const y0 = Math.floor(height * 0.07)
  const y1 = Math.floor(height * 0.93)
  return raw.map((v, i) => (i >= y0 && i <= y1 && v >= minRun ? v : 0))
}

/** Columns where the longest grey run spans most of the height (left/right card border). */
function cardLeftRightBorderColumnHistogram(imageData: ImageData) {
  const { width, height } = imageData
  const raw = greyBorderHistogram(imageData, true)
  const minRun = Math.floor(height * 0.22)
  const x0 = Math.floor(width * 0.12)
  const x1 = Math.floor(width * 0.98)
  return raw.map((v, i) => (i >= x0 && i <= x1 && v >= minRun ? v : 0))
}

/**
 * Card borders are two strong peaks (top/bottom or left/right), not one long plateau.
 * findHistogramRange's first-to-last peak picks almost the full axis when many rows qualify.
 */
function findBorderPeaks(
  histogram: number[],
  imageSpan: number,
  startBand: [number, number],
  endBand: [number, number],
  minFraction = 0.12
) {
  const [a0, a1] = startBand
  const [b0, b1] = endBand
  const minSpan = Math.max(48, imageSpan * minFraction)
  const max = Math.max(...histogram)
  if (max <= 0) return null
  const minScore = max * 0.35

  let start = a0
  let startScore = 0
  for (let i = a0; i < a1; i++) {
    if (histogram[i] > startScore) {
      startScore = histogram[i]
      start = i
    }
  }

  let end = b0
  let endScore = 0
  for (let i = b0; i < b1; i++) {
    if (histogram[i] > endScore) {
      endScore = histogram[i]
      end = i
    }
  }

  if (startScore < minScore || endScore < minScore) return null
  if (end - start < minSpan) return null
  return [start, end] as const
}

function findVerticalCardBounds(imageData: ImageData) {
  const { height } = imageData
  const histogram = cardTopBottomBorderRowHistogram(imageData)
  return findBorderPeaks(
    histogram,
    height,
    [Math.floor(height * 0.07), Math.floor(height * 0.42)],
    [Math.floor(height * 0.58), Math.floor(height * 0.93)]
  )
}

function findHorizontalCardBounds(imageData: ImageData) {
  const { width } = imageData
  const histogram = cardLeftRightBorderColumnHistogram(imageData)
  return findBorderPeaks(
    histogram,
    width,
    [Math.floor(width * 0.12), Math.floor(width * 0.52)],
    [Math.floor(width * 0.48), Math.floor(width * 0.98)]
  )
}

function findCardSpan(
  histogram: number[],
  imageSpan: number,
  minFraction = 0.12
) {
  const [a, b] = findHistogramRange(histogram, 0.3, 4)
  const minSpan = Math.max(48, imageSpan * minFraction)
  if (b - a >= minSpan) return [a, b] as const
  return null
}

function cropInnerDiscCard(
  imageData: ImageData,
  debugImgs?: Record<string, string>
) {
  const { width, height } = imageData
  const sourceCanvas = imageDataToCanvas(imageData)

  // Detect all edges on the panel image, then crop once (matches debug histogram lines)
  let top = 0
  let bottom = height
  const verticalSpan = findVerticalCardBounds(imageData)
  if (verticalSpan) [top, bottom] = verticalSpan

  let left = 0
  let right = width
  const horizontalGrey = findHorizontalCardBounds(imageData)
  if (horizontalGrey) {
    left = horizontalGrey[0]
    right = horizontalGrey[1]
  } else {
    const horizontalFill = findCardSpan(
      cardFillHistogram(imageData, true),
      width,
      0.2
    )
    if (horizontalFill) [left, right] = horizontalFill
  }

  if (debugImgs) {
    const vertCanvas = imageDataToCanvas(imageData)
    drawHistogram(
      vertCanvas,
      cardTopBottomBorderRowHistogram(imageData),
      { r: 255, g: 0, b: 0, a: 100 },
      false
    )
    drawCropMark(vertCanvas, top, { r: 0, g: 255, b: 0, a: 220 }, true)
    drawCropMark(vertCanvas, bottom, { r: 0, g: 128, b: 255, a: 220 }, true)
    debugImgs['innerCard vertical'] = vertCanvas.toDataURL()

    const horiCanvas = imageDataToCanvas(imageData)
    drawHistogram(horiCanvas, cardLeftRightBorderColumnHistogram(imageData), {
      r: 255,
      g: 0,
      b: 0,
      a: 100,
    })
    drawCropMark(horiCanvas, left, { r: 0, g: 255, b: 0, a: 220 }, false)
    drawCropMark(horiCanvas, right, { r: 0, g: 128, b: 255, a: 220 }, false)
    debugImgs['innerCard horizontal'] = horiCanvas.toDataURL()
  }

  const inset = 3
  left = clamp(left + inset, 0, width - 1)
  right = clamp(right - inset, left + 1, width)
  top = clamp(top + inset, 0, height - 1)
  bottom = clamp(bottom - inset, top + 1, height)

  const cropped = crop(sourceCanvas, {
    x1: left,
    x2: right,
    y1: top,
    y2: bottom,
  })

  if (debugImgs) {
    debugImgs['innerCard cropped'] = imageDataToCanvas(cropped).toDataURL()
  }

  return cropped
}

function cropDiscCard(
  imageData: ImageData,
  debugImgs?: Record<string, string>
) {
  // Check if the image is within 90% of 16:9 ratio and crop to right 1/3
  const aspectRatio = imageData.width / imageData.height
  const targetRatio = 16 / 9
  const ratioTolerance = 0.1 // 10% tolerance
  const isNear16to9 =
    Math.abs(aspectRatio - targetRatio) <= targetRatio * ratioTolerance

  let processedImageData = imageData
  if (isNear16to9) {
    // Crop to keep only the right 1/3 of the image
    const sourceX = Math.floor((imageData.width * 2) / 3) // Start from 2/3 of the width
    const sourceWidth = Math.floor(imageData.width / 3) // Take only 1/3 of the width

    processedImageData = crop(imageDataToCanvas(imageData), {
      x1: sourceX,
      x2: sourceX + sourceWidth,
      y1: 0,
      y2: imageData.height,
    })

    if (debugImgs) {
      debugImgs['panel crop'] =
        imageDataToCanvas(processedImageData).toDataURL()
    }
  }

  return cropInnerDiscCard(processedImageData, debugImgs)
}
