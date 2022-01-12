import {
  ocr, findBestArtifact, parseSetKeys,
  parseSlotKeys,
  parseSubstats,
  parseMainStatKeys,
  parseMainStatValues,
} from "./ScanningUtil"
import { createCanvas, loadImage, createImageData, ImageData, registerFont } from 'canvas'
import { ArtifactSheet } from "./ArtifactSheet"
import { IArtifact } from "../Types/artifact";
import { writeFile } from 'fs/promises'
import { tmpdir } from "os";
import { resolve } from "path";
import { StatData } from "../StatData";
import Artifact from "./Artifact";


class MockImageData extends ImageData {
  constructor(d: Uint8ClampedArray, sw: number, sh?: number | undefined, settings?: ImageDataSettings | undefined) {
    const { data, width, height } = createImageData(d, sw, sh)
    super(data, width, height, settings)
  }
}

window.ImageData = MockImageData as typeof window.ImageData

registerFont('./ja-jp.ttf', { family: 'serif' })

async function generateTestArtifact(artifact: IArtifact) {
  const width = 1009, height = 1144
  const canvas = createCanvas(1009, 1144)
  const ctx = canvas.getContext('2d')

  const background = await loadImage('./background.png')

  ctx.drawImage(background, 0, 0, width, height)

  const l = 69

  ctx.font = "65px SDK_JP_Web, serif"
  ctx.fillStyle = "#fff"
  ctx.fillText("Fake Artifact", l, 95)
  ctx.font = "41px SDK_JP_Web, serif"
  ctx.fillText(`${Artifact.slotName(artifact.slotKey)}`, l, 195)
  ctx.font = "86px SDK_JP_Web, serif"
  ctx.fillText(`${Artifact.mainStatValue(artifact.mainStatKey, artifact.rarity, artifact.level)}`, l, 450)
  ctx.font = "48px SDK_JP_Web, serif"
  ctx.textAlign = "center"
  ctx.fillText(`+${artifact.level}`, l+57, 678)
  ctx.textAlign = "left"
  ctx.fillStyle = "#bfafa8"
  ctx.font = "45px SDK_JP_Web, serif"
  ctx.fillText(StatData[artifact.mainStatKey].name, l, 360)
  ctx.fillStyle = "#495366"
  ctx.font = "47px SDK_JP_Web, serif"
  artifact.substats.forEach((substat, i) => {
    const {name, unit} = StatData[substat.key]
    ctx.fillText(`·${name}+${substat.value}${unit ?? ''}`, l, 781 + 77 * i)
  })
  ctx.fillStyle = "#5cb256"
  ctx.font = "46px SDK_JP_Web, serif"
  ctx.fillText(`${artifact.setKey}:(0)`, l, 1089)

  const previewPath = resolve(tmpdir(), `${Date.now()}.png`)
  console.log(previewPath)
  writeFile(previewPath, canvas.toBuffer())

  return ctx.getImageData(0, 0, width, height)
}

describe('processEntry', () => {
  test('default', async () => {
    try {
      const subject: IArtifact = {
        "exclude": false,
        "level": 8,
        "location": "",
        "lock": false,
        "mainStatKey": "atk",
        "rarity": 5,
        "setKey": "NoblesseOblige",
        "slotKey": "plume",
        "substats": [
          {
            "key": "critRate_",
            "value": 2.7,
          },
          {
            "key": "def",
            "value": 21,
          },
          {
            "key": "def_",
            "value": 10.2,
          },
          {
            "key": "hp",
            "value": 269,
          },
        ],
      }
      const sheets = await ArtifactSheet.getAll()
      const ocrResult = await ocr(await generateTestArtifact(subject))

      const [artifact, texts] = findBestArtifact(
        sheets, ocrResult.rarities,
        parseSetKeys(ocrResult.artifactSetTexts, sheets),
        parseSlotKeys(ocrResult.whiteTexts),
        parseSubstats(ocrResult.substatTexts),
        parseMainStatKeys(ocrResult.whiteTexts),
        parseMainStatValues(ocrResult.whiteTexts)
      )

      expect(artifact).toStrictEqual(subject)
    } catch (e) {
      console.error(e)
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  })
})