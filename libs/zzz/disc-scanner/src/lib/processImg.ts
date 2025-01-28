import {
  crop,
  darkerColor,
  drawHistogram,
  drawline,
  fileToURL,
  findHistogramRange,
  histogramContAnalysis,
  imageDataToCanvas,
  invertColors,
  lighterColor,
  thresholdFilter,
  urlToImageData,
} from '@genshin-optimizer/common/img-util'
import { levenshteinDistance } from '@genshin-optimizer/common/util'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import { discSlotToMainStatKeys } from '@genshin-optimizer/zzz/consts'
import type { IDisc } from '@genshin-optimizer/zzz/db'
import type { ReactNode } from 'react'
import { blackColor } from './consts'
import { statMapEngMap } from './enStringMap'
import {
  parseLvlRarity,
  parseMainStatKeys,
  parseSet,
  parseSetSlot,
  parseSubstats,
} from './parse'

export type Processed = {
  fileName: string
  imageURL: string
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
  textsFromImage: (
    imageData: ImageData,
    options?: object | undefined
  ) => Promise<string[]>,
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
    texts: [],
    debugImgs,
  }

  const bwHeader = zzzPreprocessImage(discCardImageData)

  if (debugImgs) {
    debugImgs['bwHeader'] = imageDataToCanvas(bwHeader).toDataURL()
  }

  const whiteTexts = (await textsFromImage(bwHeader)).map((t) => t.trim())
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
function cropDiscCard(
  imageData: ImageData,
  debugImgs?: Record<string, string>
) {
  const histogram = histogramContAnalysis(
    imageData,
    darkerColor(blackColor),
    lighterColor(blackColor)
  )
  let skipCrop = imageData.width < 500
  let a = 0
  let b = imageData.width
  if (!skipCrop) {
    // look for the black line outside the card outline. This will likely be only a pixel wide
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[a, b] = findHistogramRange(histogram, 0.9, 1)
  }

  if (b - a < 100) {
    skipCrop = true
    a = 0
    b = imageData.width
  }

  const cropped = skipCrop
    ? imageData
    : crop(imageDataToCanvas(imageData), { x1: a, x2: b })

  if (debugImgs) {
    const canvas = imageDataToCanvas(imageData)

    drawHistogram(canvas, histogram, {
      r: 255,
      g: 0,
      b: 0,
      a: 100,
    })
    drawline(canvas, a, { r: 0, g: 255, b: 0, a: 150 })
    drawline(canvas, b, { r: 0, g: 0, b: 255, a: 150 })

    debugImgs['fullAnalysis'] = canvas.toDataURL()
  }
  const horihistogram = histogramContAnalysis(
    cropped,
    darkerColor(blackColor),
    lighterColor(blackColor),
    false
  )
  let bot = 0
  let top = cropped.height
  // look for the black line outside the card outline. This will likely be only a pixel wide
  if (!skipCrop) {
    // eslint-disable-next-line @typescript-eslint/no-extra-semi
    ;[bot, top] = findHistogramRange(horihistogram, 0.9, 1)
  }

  const cropped2 = skipCrop
    ? cropped
    : crop(imageDataToCanvas(cropped), { y1: bot, y2: top })

  if (debugImgs) {
    const canvas = imageDataToCanvas(cropped)

    drawHistogram(
      canvas,
      horihistogram,
      {
        r: 255,
        g: 0,
        b: 0,
        a: 100,
      },
      false
    )
    drawline(canvas, a, { r: 0, g: 255, b: 0, a: 150 }, false)
    drawline(canvas, b, { r: 0, g: 0, b: 255, a: 150 }, false)

    debugImgs['fullAnalysis horizontal'] = canvas.toDataURL()
  }

  return cropped2
}
