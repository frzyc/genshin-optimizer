import {
  ocr, findBestArtifact, parseSetKeys,
  parseSlotKeys,
  parseSubstats,
  parseMainStatKeys,
  parseMainStatValues,
} from "./ScanningUtil"
import { createCanvas, loadImage, createImageData, ImageData } from 'canvas'
import { ArtifactSheet } from "./ArtifactSheet"
import { ArtifactRarity, ArtifactSetKey, CharacterKey, ElementKey, SetNum, SlotKey } from "../Types/consts";


class MockImageData extends ImageData {
  constructor(d: Uint8ClampedArray, sw: number, sh?: number | undefined, settings?: ImageDataSettings | undefined) {
    const { data, width, height } = createImageData(d, sw, sh)
    super(data, width, height, settings)
  }
}

window.ImageData = MockImageData as typeof window.ImageData 

async function generateTestArtifact() {
  const width = 1009, height = 1144
  // registerFont('./ja-jp.ttf', { family: 'sans-serif' })
  const canvas = createCanvas(1009, 1144)
  const ctx = canvas.getContext('2d')

  const background = await loadImage('./baseline.png')

  ctx.drawImage(background, 0, 0, width, height)

  return ctx.getImageData(0, 0, width, height)
}

describe('processEntry', () => {
  test('default', async () => {
    try {
      const sheets = await ArtifactSheet.getAll()
      const ocrResult = await ocr(await generateTestArtifact())

      const [artifact, texts] = findBestArtifact(
        sheets, ocrResult.rarities,
        parseSetKeys(ocrResult.artifactSetTexts, sheets),
        parseSlotKeys(ocrResult.whiteTexts),
        parseSubstats(ocrResult.substatTexts),
        parseMainStatKeys(ocrResult.whiteTexts),
        parseMainStatValues(ocrResult.whiteTexts)
      )

      expect(artifact).toStrictEqual({
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
      })
    } catch (e) {
      console.error(e)
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  })
})