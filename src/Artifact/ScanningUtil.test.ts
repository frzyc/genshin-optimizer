import { createCanvas, createImageData, ImageData, loadImage, registerFont } from 'canvas';
import { writeFile } from 'fs/promises';
import { tmpdir } from "os";
import { resolve } from "path";
import { ArtifactSlotsData } from "../Data/ArtifactData";
import Stat from "../Stat";
import { IArtifact } from "../Types/artifact";
import { allSlotKeys } from "../Types/consts";
import { valueStringWithUnit } from "../Util/UIUtil";
import Artifact from "./Artifact";
import { ArtifactSheet } from "./ArtifactSheet";
import {
  findBestArtifact, ocr, parseMainStatKeys,
  parseMainStatValues, parseSetKeys,
  parseSlotKeys,
  parseSubstats
} from "./ScanningUtil";


class MockImageData extends ImageData {
  constructor(d: Uint8ClampedArray, sw: number, sh?: number | undefined, settings?: ImageDataSettings | undefined) {
    const { data, width, height } = createImageData(d, sw, sh)
    super(data, width, height, settings)
  }
}

window.ImageData = MockImageData as typeof window.ImageData

const assetDir = 'src/Artifact/TestAssets'
const fontPath = resolve('.', assetDir, 'ja-jp.ttf')
const backgroundPath = resolve('.', assetDir, 'background.png')


async function generateArtifactImage(artifact: IArtifact) {
  const width = 1009, height = 1144
  const canvas = createCanvas(1009, 1144)
  const ctx = canvas.getContext('2d')

  const background = await loadImage(backgroundPath)

  ctx.drawImage(background, 0, 0, width, height)

  const leftPad = 69

  const slotName = `${Artifact.slotName(artifact.slotKey)}`
  const mainStatName = `${Stat.getStatNameRaw(artifact.mainStatKey)}`
  const mainStat = `${valueStringWithUnit(Artifact.mainStatValue(artifact.mainStatKey, artifact.rarity, artifact.level), Stat.getStatUnit(artifact.mainStatKey))}`
  const level = `+${artifact.level}`
  const subStats = artifact.substats.map((substat) =>
    `·${Stat.getStatNameRaw(substat.key)}+${valueStringWithUnit(substat.value, Stat.getStatUnit(substat.key))}`
  )
  const artifactSet = `${artifact.setKey}:(0)`

  ctx.font = "65px SDK_JP_Web, serif"
  ctx.fillStyle = "#fff"
  ctx.fillText("Fake Artifact", leftPad, 95)
  ctx.font = "41px SDK_JP_Web, serif"
  ctx.fillText(slotName, leftPad, 195)
  ctx.font = "86px SDK_JP_Web, serif"
  ctx.fillText(mainStat, leftPad, 450)
  ctx.font = "48px SDK_JP_Web, serif"
  ctx.textAlign = "center"
  ctx.fillText(level, leftPad + 57, 678)
  ctx.textAlign = "left"
  ctx.fillStyle = "#bfafa8"
  ctx.font = "45px SDK_JP_Web, serif"
  ctx.fillText(mainStatName, leftPad, 360)
  ctx.fillStyle = "#495366"
  ctx.font = "47px SDK_JP_Web, serif"
  subStats.forEach((subStat, i) => {
    ctx.fillText(subStat, leftPad, 781 + 77 * i)
  })
  ctx.fillStyle = "#5cb256"
  ctx.font = "46px SDK_JP_Web, serif"
  ctx.fillText(artifactSet, leftPad, 1089)

  return { imageData: ctx.getImageData(0, 0, width, height), imageURL: canvas.toDataURL() }
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toPassOCR(): R;
    }
  }
}

expect.extend({
  async toPassOCR(subject: IArtifact) {
    const previewPath = resolve(tmpdir(), `${Date.now()}.png`)
    const { imageData, imageURL } = await generateArtifactImage(subject)
    const ocrResult = await ocr(imageData)
    const sheets = await ArtifactSheet.getAll()

    const [artifact] = findBestArtifact(
      sheets, ocrResult.rarities,
      parseSetKeys(ocrResult.artifactSetTexts, sheets),
      parseSlotKeys(ocrResult.whiteTexts),
      parseSubstats(ocrResult.substatTexts),
      parseMainStatKeys(ocrResult.whiteTexts),
      parseMainStatValues(ocrResult.whiteTexts)
    )

    const pass = this.equals(
      subject,
      artifact,
      [
        this.utils.iterableEquality,
        this.utils.subsetEquality,
      ],
      true
    )

    const diff = this.utils.diff(
      subject,
      artifact,
      {
        expand: true
      }
    )

    await writeFile(previewPath, Buffer.from(imageURL.split(',')[1], "base64"))
    return {
      pass,
      message: () => `Failed on image: ${previewPath}\n${diff}`
    }
  }
})

describe('OCR', () => {
  beforeAll(() => {
    registerFont(fontPath, { family: 'serif' })
  })

  const defaultSubject: IArtifact = {
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


  test('default', async () => {
    await expect(defaultSubject).toPassOCR()
  })

  describe.skip.each(allSlotKeys)('%s', (slotKey) => {
    describe.each(ArtifactSlotsData[slotKey].stats)('%s', (mainStatKey) => {
      test('Artifact', async () => {
        const subject: IArtifact = {
          ...defaultSubject,
          slotKey,
          mainStatKey
        }
        await expect(subject).toPassOCR()
      })
    })
  })
})