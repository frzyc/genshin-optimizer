import type { IArtifact } from '@genshin-optimizer/gi-good'
import { clamp } from '@genshin-optimizer/util'
import type { ReactNode } from 'react'

import type { Color } from '@genshin-optimizer/img-util'
import {
  bandPass,
  cropHorizontal,
  cropImageData,
  darkerColor,
  drawHistogram,
  drawline,
  fileToURL,
  findHistogramRange,
  histogramAnalysis,
  histogramContAnalysis,
  imageDataToCanvas,
  lighterColor,
  urlToImageData,
} from '@genshin-optimizer/img-util'
import {
  blueTitleDarkerColor,
  blueTitleLighterColor,
  cardWhite,
  equipColor,
  goldenTitleDarkerColor,
  goldenTitleLighterColor,
  greenTextColor,
  lockColor,
  purpleTitleDarkerColor,
  purpleTitleLighterColor,
  starColor,
  textColorDark,
  textColorLight,
} from './consts'
import type { TextKey } from './findBestArtifact'
import { findBestArtifact } from './findBestArtifact'
import {
  parseLocation,
  parseMainStatKeys,
  parseMainStatValues,
  parseSetKeys,
  parseSlotKeys,
  parseSubstats,
} from './parse'

export type Processed = {
  fileName: string
  imageURL: string
  artifact: IArtifact
  texts: Partial<Record<TextKey, ReactNode>>
  debugImgs?: Record<string, string> | undefined
}
export type Outstanding = {
  f: File
  fName: string
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
  const artifactCardImageData = verticallyCropArtifactCard(imageData, debugImgs)
  const artifactCardCanvas = imageDataToCanvas(artifactCardImageData)

  const titleHistogram = findTitle(artifactCardImageData)
  const [titleTop, titleBot] = titleHistogram
    ? findHistogramRange(titleHistogram)
    : [0, 0]

  const whiteCardHistogram = histogramContAnalysis(
    artifactCardImageData,
    darkerColor(cardWhite),
    lighterColor(cardWhite),
    false
  )
  const [whiteCardTop, whiteCardBot] = findHistogramRange(
    whiteCardHistogram,
    0.8,
    2
  )

  const equipHistogram = histogramContAnalysis(
    imageData,
    darkerColor(equipColor),
    lighterColor(equipColor),
    false
  )

  const hasEquip = equipHistogram.some(
    (i) => i > artifactCardImageData.width * 0.5
  )
  const [equipTop, equipBot] = findHistogramRange(equipHistogram)

  const artifactCardCropped = cropHorizontal(
    artifactCardCanvas,
    titleTop,
    hasEquip ? equipBot : whiteCardBot
  )

  const equippedCropped = hasEquip
    ? cropHorizontal(artifactCardCanvas, equipTop, equipBot)
    : undefined
  /**
   * Technically this is a way to get both the set+slot
   */
  // const goldenTitleCropped = cropHorizontal(
  //   artifactCardCanvas,
  //   titleTop,
  //   titleBot
  // )

  // if (debug)
  //   debugImgs['goldenTitlecropped'] =
  //     imageDataToCanvas(goldenTitleCropped).toDataURL()

  const headerCropped = cropHorizontal(
    artifactCardCanvas,
    titleBot,
    whiteCardTop
  )

  if (debugImgs) {
    const canvas = imageDataToCanvas(artifactCardImageData)
    titleHistogram &&
      drawHistogram(
        canvas,
        titleHistogram,
        {
          r: 0,
          g: 150,
          b: 150,
          a: 100,
        },
        false
      )

    drawHistogram(
      canvas,
      whiteCardHistogram,
      { r: 150, g: 0, b: 0, a: 100 },
      false
    )
    drawHistogram(canvas, equipHistogram, { r: 0, g: 0, b: 100, a: 100 }, false)

    drawline(canvas, titleTop, { r: 0, g: 255, b: 0, a: 200 }, false)
    drawline(
      canvas,
      hasEquip ? equipBot : whiteCardBot,
      { r: 0, g: 0, b: 255, a: 200 },
      false
    )
    drawline(canvas, whiteCardTop, { r: 255, g: 0, b: 200, a: 200 }, false)

    debugImgs['artifactCardAnalysis'] = canvas.toDataURL()
  }

  if (debugImgs)
    debugImgs['headerCropped'] = imageDataToCanvas(headerCropped).toDataURL()

  const whiteCardCropped = cropHorizontal(
    artifactCardCanvas,
    whiteCardTop,
    whiteCardBot
  )

  const greentextHisto = histogramAnalysis(
    whiteCardCropped,
    darkerColor(greenTextColor),
    lighterColor(greenTextColor),
    false
  )

  const [greenTextTop, greenTextBot] = findHistogramRange(greentextHisto, 0.2)

  if (debugImgs) {
    const canvas = imageDataToCanvas(whiteCardCropped)
    drawHistogram(canvas, greentextHisto, { r: 100, g: 0, b: 0, a: 100 }, false)
    drawline(canvas, greenTextTop, { r: 0, g: 255, b: 0, a: 200 }, false)
    drawline(canvas, greenTextBot, { r: 0, g: 0, b: 255, a: 200 }, false)
    debugImgs['whiteCardAnalysis'] = canvas.toDataURL()
  }

  const greenTextBuffer = greenTextBot - greenTextTop

  const greenTextCropped = cropHorizontal(
    imageDataToCanvas(whiteCardCropped),
    greenTextTop - greenTextBuffer,
    greenTextBot + greenTextBuffer
  )

  const substatsCardCropped = cropHorizontal(
    imageDataToCanvas(whiteCardCropped),
    0,
    greenTextTop
  )
  const lockHisto = histogramAnalysis(
    whiteCardCropped,
    darkerColor(lockColor),
    lighterColor(lockColor)
  )
  const locked = lockHisto.filter((v) => v > 5).length > 5

  if (debugImgs) {
    const canvas = imageDataToCanvas(substatsCardCropped)
    drawHistogram(canvas, lockHisto, { r: 0, g: 100, b: 0, a: 100 })
    debugImgs['substatsCardCropped'] = canvas.toDataURL()
  }

  const bwHeader = bandPass(
    headerCropped,
    { r: 140, g: 140, b: 140 },
    { r: 255, g: 255, b: 255 },
    'bw'
  )
  const bwGreenText = bandPass(
    greenTextCropped,
    { r: 30, g: 100, b: 30 },
    { r: 200, g: 255, b: 200 },
    'bw'
  )
  const bwEquipped =
    equippedCropped &&
    bandPass(
      equippedCropped,
      darkerColor(textColorDark),
      lighterColor(textColorLight),
      'bw'
    )
  if (debugImgs) {
    debugImgs['bwHeader'] = imageDataToCanvas(bwHeader).toDataURL()
    debugImgs['bwGreenText'] = imageDataToCanvas(bwGreenText).toDataURL()
    if (bwEquipped)
      debugImgs['bwEquipped'] = imageDataToCanvas(bwEquipped).toDataURL()
  }

  const [whiteTexts, substatTexts, artifactSetTexts, equippedTexts] =
    await Promise.all([
      // slotkey, mainStatValue, level
      textsFromImage(bwHeader, {
        // only the left half is worth scanning
        rectangle: {
          top: 0,
          left: 0,
          width: Math.floor(bwHeader.width * 0.7),
          height: bwHeader.height,
        },
      }),
      // substats
      textsFromImage(substatsCardCropped),
      // artifact set, look for greenish texts
      textsFromImage(bwGreenText),
      // equipment
      bwEquipped && textsFromImage(bwEquipped),
    ])

  const rarity = parseRarity(headerCropped, debugImgs)

  const [artifact, texts] = findBestArtifact(
    new Set([rarity]),
    parseSetKeys(artifactSetTexts),
    parseSlotKeys(whiteTexts),
    parseSubstats(substatTexts),
    parseMainStatKeys(whiteTexts),
    parseMainStatValues(whiteTexts),
    equippedTexts ? parseLocation(equippedTexts) : '',
    locked
  )

  return {
    fileName: fName,
    imageURL: imageDataToCanvas(artifactCardCropped).toDataURL(),
    artifact,
    texts,
    debugImgs,
  }
}
function verticallyCropArtifactCard(
  imageData: ImageData,
  debugImgs?: Record<string, string>
) {
  const histogram = histogramContAnalysis(
    imageData,
    darkerColor(cardWhite),
    lighterColor(cardWhite)
  )

  const [a, b] = findHistogramRange(histogram)

  const cropped = cropImageData(
    imageDataToCanvas(imageData),
    a,
    0,
    b - a,
    imageData.height
  )

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

    // debugImgs['horicropped'] = imageDataToCanvas(cropped).toDataURL()
  }

  return cropped
}

function parseRarity(
  headerData: ImageData,
  debugImgs?: Record<string, string>
) {
  const hist = histogramContAnalysis(
    headerData,
    darkerColor(starColor),
    lighterColor(starColor),
    false
  )
  const [starTop, starBot] = findHistogramRange(hist, 0.3)

  const stars = cropImageData(
    imageDataToCanvas(headerData),
    0,
    starTop,
    headerData.width,
    starBot - starTop
  )

  const starsHistogram = histogramContAnalysis(
    stars,
    darkerColor(starColor),
    lighterColor(starColor)
  )
  if (debugImgs) {
    const canvas = imageDataToCanvas(stars)
    drawHistogram(canvas, starsHistogram, { r: 100, g: 0, b: 0, a: 100 })
    debugImgs['rarity'] = canvas.toDataURL()
  }
  const maxThresh = Math.max(...starsHistogram) * 0.5
  let count = 0
  let onStar = false
  for (let i = 0; i < starsHistogram.length; i++) {
    if (starsHistogram[i] > maxThresh) {
      if (!onStar) {
        count++
        onStar = true
      }
    } else {
      if (onStar) {
        onStar = false
      }
    }
  }
  return clamp(count, 1, 5)
}

function findTitle(artifactCardImageData: ImageData) {
  const width = artifactCardImageData.width
  const widthThreshold = width * 0.7

  function findTitleColored(darkerTitleColor: Color, LighterTitleColor: Color) {
    const hist = histogramContAnalysis(
      artifactCardImageData,
      darkerColor(darkerTitleColor, 20),
      lighterColor(LighterTitleColor, 20),
      false,
      [0, 0.3] // only scan the top 30% of the img
    )
    if (hist.find((v) => v > widthThreshold)) return hist
    return null
  }
  const titleColors = [
    [goldenTitleDarkerColor, goldenTitleLighterColor],
    [purpleTitleDarkerColor, purpleTitleLighterColor],
    [blueTitleDarkerColor, blueTitleLighterColor],
  ] as const
  // Return first detected title color
  return titleColors.reduce(
    (a, curr) => (a ? a : findTitleColored(curr[0], curr[1])),
    null as null | number[]
  )
}
