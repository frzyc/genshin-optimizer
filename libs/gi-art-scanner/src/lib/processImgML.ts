import * as ort from 'onnxruntime-web'
import { lockColor } from './consts'
import {
  crop,
  imageDataToCanvas,
  resize,
  drawBox,
  invert,
  histogramAnalysis,
  darkerColor,
  lighterColor,
} from '@genshin-optimizer/img-util'
import { PSM } from 'tesseract.js'
import { parseRarity } from './processImg'
import {
  parseMainStatKeys,
  parseMainStatValues,
  parseSetKeys,
  parseSlotKeys,
  parseSubstats,
} from './parse'
import { findBestArtifact } from './findBestArtifact'

type Box = {
  x: number
  y: number
  w: number
  h: number
}
type MLBoxes = {
  title: Box
  slot: Box
  mainstat: Box
  level: Box
  rarity: Box
  substats: Box
  set: Box
  lock: Box
  bbox: Box
}

function getBox(
  result: ort.TypedTensor<'float32'>,
  height: number,
  width: number,
  i: number,
  offset?: { x1?: number; y1?: number }
): Box {
  const x1 = result.data[4 * i] * width,
    y1 = result.data[4 * i + 1] * height,
    x2 = result.data[4 * i + 2] * width,
    y2 = result.data[4 * i + 3] * height

  const w = x2 - x1,
    h = y2 - y1
  return { x: x1 + (offset?.x1 ?? 0), y: y1 + (offset?.y1 ?? 0), w, h }
}
function padBox(box: Box, pad: number): Box {
  return {
    x: Math.max(box.x - (pad * box.w) / 2, 0),
    y: Math.max(box.y - (pad * box.h) / 2, 0),
    w: box.w * (1 + pad),
    h: box.h * (1 + pad),
  }
}
function box2CropOption(box: Box, pad?: number) {
  if (pad) box = padBox(box, pad)
  return {
    x1: box.x,
    y1: box.y,
    x2: box.x + box.w,
    y2: box.y + box.h,
  }
}

function prepareForOnnx(imageData: ImageData): Float32Array {
  // Expects (200, 200, 3) image. Re-order + scale data to network's expected domain.

  const imageBuffer = new Float32Array(200 * 200 * 3)
  imageBuffer.fill(0)
  const normalization = [
    { mu: 0.485, std: 0.229 },
    { mu: 0.456, std: 0.224 },
    { mu: 0.406, std: 0.225 },
  ]
  const _i = 1
  const _j = 4 * imageData.width // 4 * 200
  const _k = 4

  for (let i = 0; i < 3; i++) {
    const { mu, std } = normalization[i]
    for (let j = 0; j < 200; j++) {
      for (let k = 0; k < 200; k++) {
        const v = imageData.data[_i * i + _j * j + _k * k] / 255.0
        imageBuffer[i * 200 * 200 + j * 200 + k] = (v - mu) / std
      }
    }
  }
  return imageBuffer
}

async function doInference(
  imageData: ImageData,
  session: ort.InferenceSession,
  cropOptions: {
    x1?: number
    x2?: number
    y1?: number
    y2?: number
  },
  debugImgs?: Record<string, string>
): Promise<MLBoxes> {
  const imageCropped = crop(imageDataToCanvas(imageData), cropOptions)
  const imageSized = resize(imageCropped, { width: 200, height: 200 })
  const imageBuffer = prepareForOnnx(imageSized)

  if (debugImgs)
    debugImgs['MLInput'] = imageDataToCanvas(imageSized).toDataURL()

  const feeds = {
    input1: new ort.Tensor('float32', imageBuffer, [1, 3, 200, 200]),
  }
  const results = await session.run(feeds)
  const result = results['output1'] as ort.TypedTensor<'float32'>
  const h = imageCropped.height,
    w = imageCropped.width
  return {
    title: getBox(result, h, w, 0, cropOptions),
    slot: getBox(result, h, w, 1, cropOptions),
    mainstat: getBox(result, h, w, 2, cropOptions),
    level: getBox(result, h, w, 3, cropOptions),
    rarity: getBox(result, h, w, 4, cropOptions),
    substats: getBox(result, h, w, 5, cropOptions),
    set: getBox(result, h, w, 6, cropOptions),
    lock: getBox(result, h, w, 7, cropOptions),
    bbox: getBox(result, h, w, 8, cropOptions),
  }
}

export async function processEntryML(
  imageDataRaw: ImageData,
  textsFromImage: (
    imageData: ImageData,
    options?: object | undefined
  ) => Promise<string[]>,
  debugImgs?: Record<string, string>
) {
  // const session = await ort.InferenceSession.create('https://github.com/tooflesswulf/genshin-scanner/raw/main/onnx/simplenet.onnx')
  const session = await ort.InferenceSession.create('./assets/simplenet.onnx', {
    executionProviders: ['webgl'],
  })

  const mlBoxes0 = await doInference(imageDataRaw, session, {}, debugImgs)
  const mlBoxes = await doInference(
    imageDataRaw,
    session,
    box2CropOption(mlBoxes0.bbox, 0.2),
    debugImgs
  )

  if (debugImgs) {
    const canvas = imageDataToCanvas(imageDataRaw)

    drawBox(canvas, mlBoxes.title, { r: 31, g: 119, b: 180, a: 80 })
    drawBox(canvas, mlBoxes.slot, { r: 255, g: 127, b: 14, a: 80 })
    drawBox(canvas, mlBoxes.mainstat, { r: 44, g: 160, b: 44, a: 80 })
    drawBox(canvas, mlBoxes.level, { r: 214, g: 39, b: 40, a: 80 })
    drawBox(canvas, mlBoxes.rarity, { r: 128, g: 103, b: 189, a: 80 })
    drawBox(canvas, mlBoxes.substats, { r: 140, g: 86, b: 75, a: 80 })
    drawBox(canvas, mlBoxes.set, { r: 227, g: 119, b: 194, a: 80 })
    drawBox(canvas, mlBoxes.lock, { r: 188, g: 189, b: 34, a: 80 })
    drawBox(canvas, mlBoxes.bbox, { r: 127, g: 127, b: 127, a: 60 })

    debugImgs['MLBoxes'] = canvas.toDataURL()
  }

  const rawCanvas = imageDataToCanvas(imageDataRaw)
  const titleCrop = crop(rawCanvas, box2CropOption(mlBoxes.title, 0.1))
  const titleText = textsFromImage(titleCrop)

  const slotCrop = crop(rawCanvas, box2CropOption(mlBoxes.slot, 0.1))
  const slotText = textsFromImage(slotCrop)

  const levelCrop = crop(rawCanvas, box2CropOption(mlBoxes.level, 0.1))
  const levelText = textsFromImage(invert(levelCrop))

  const mainstatCrop = crop(rawCanvas, box2CropOption(mlBoxes.mainstat, 0.1))
  const mainstatText = textsFromImage(mainstatCrop, {
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
  })

  const substatCrop = crop(rawCanvas, box2CropOption(mlBoxes.substats, 0.1))
  const substatText = textsFromImage(substatCrop)

  const setCrop = crop(rawCanvas, box2CropOption(mlBoxes.set, 0.1))
  const setText = textsFromImage(setCrop)

  const lockCrop = crop(rawCanvas, box2CropOption(mlBoxes.lock, 0.1))
  const lockHisto = histogramAnalysis(
    lockCrop,
    darkerColor(lockColor),
    lighterColor(lockColor)
  )
  const locked = lockHisto.filter((v) => v > 5).length > 5

  const rarityCrop = crop(rawCanvas, box2CropOption(mlBoxes.rarity, 0.1))
  const rarity = parseRarity(rarityCrop, debugImgs)

  const [artifact, texts] = findBestArtifact(
    new Set([rarity]),
    parseSetKeys(await setText),
    parseSlotKeys(await slotText),
    parseSubstats(await substatText),
    parseMainStatKeys(await mainstatText),
    parseMainStatValues(await mainstatText),
    '',
    locked
  )

  console.log('DETECTION: ', { artifact, texts })

  return [0, 0, 1, 1]
}
