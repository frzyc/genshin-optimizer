import {
  ocr, findBestArtifact, parseSetKeys,
  parseSlotKeys,
  parseSubstats,
  parseMainStatKeys,
  parseMainStatValues,
} from "./ScanningUtil"
import { createCanvas, loadImage, createImageData, ImageData, registerFont } from 'canvas'
import { ArtifactSheet } from "./ArtifactSheet"
import { allMainStatKeys, IArtifact } from "../Types/artifact";
import { writeFile } from 'fs/promises'
import { tmpdir } from "os";
import { resolve } from "path";
import { StatData } from "../StatData";
import Artifact from "./Artifact";
import { allArtifactSets, allSlotKeys } from "../Types/consts";
import { ArtifactSlotsData } from "../Data/ArtifactData";


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


async function generateTestArtifact(artifact: IArtifact) {
  const width = 1009, height = 1144
  const canvas = createCanvas(1009, 1144)
  const ctx = canvas.getContext('2d')

  const background = await loadImage(backgroundPath)

  ctx.drawImage(background, 0, 0, width, height)

  const leftPad = 69

  ctx.font = "65px SDK_JP_Web, serif"
  ctx.fillStyle = "#fff"
  ctx.fillText("Fake Artifact", leftPad, 95)
  ctx.font = "41px SDK_JP_Web, serif"
  ctx.fillText(`${Artifact.slotName(artifact.slotKey)}`, leftPad, 195)
  ctx.font = "86px SDK_JP_Web, serif"
  ctx.fillText(`${Artifact.mainStatValue(artifact.mainStatKey, artifact.rarity, artifact.level)}`, leftPad, 450)
  ctx.font = "48px SDK_JP_Web, serif"
  ctx.textAlign = "center"
  ctx.fillText(`+${artifact.level}`, leftPad + 57, 678)
  ctx.textAlign = "left"
  ctx.fillStyle = "#bfafa8"
  ctx.font = "45px SDK_JP_Web, serif"
  ctx.fillText(StatData[artifact.mainStatKey].name, leftPad, 360)
  ctx.fillStyle = "#495366"
  ctx.font = "47px SDK_JP_Web, serif"
  artifact.substats.forEach((substat, i) => {
    const { name, unit } = StatData[substat.key]
    ctx.fillText(`·${name}+${substat.value}${unit ?? ''}`, leftPad, 781 + 77 * i)
  })
  ctx.fillStyle = "#5cb256"
  ctx.font = "46px SDK_JP_Web, serif"
  ctx.fillText(`${artifact.setKey}:(0)`, leftPad, 1089)

  return {imageData: ctx.getImageData(0, 0, width, height), imageURL: canvas.toDataURL()}
}

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

  const artifactTest = async (subject: IArtifact) => {
    const previewPath = resolve(tmpdir(), `${Date.now()}.png`)
    const {imageData, imageURL} = await generateTestArtifact(subject)
    try {
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

      expect(artifact).toStrictEqual(subject)
    } catch (e) {
      await writeFile(previewPath, Buffer.from(imageURL.split(',')[1], "base64"))
      console.error(`Failed on image: ${previewPath}`)
      throw e
    }
  }

  test('sanity', async () => {
    await artifactTest(defaultSubject)
  })

  describe.each(allArtifactSets)('%s', (setKey) => {
    describe.each(allSlotKeys)('%s', (slotKey) => {
      describe.each(ArtifactSlotsData[slotKey].stats)('%s', (mainStatKey) => {
        test('Artifact', async () => {
          const subject: IArtifact = {
            ...defaultSubject,
            setKey,
            slotKey,
            mainStatKey
          }
          await artifactTest(subject)
        })
      }) 
    })
  })
})