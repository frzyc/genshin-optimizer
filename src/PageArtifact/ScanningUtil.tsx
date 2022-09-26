import { createScheduler, createWorker, RecognizeResult, Scheduler } from 'tesseract.js';
import ColorText from '../Components/ColoredText';
import Artifact from '../Data/Artifacts/Artifact';
import { AllArtifactSheets, ArtifactSheet } from '../Data/Artifacts/ArtifactSheet';
import KeyMap, { cacheValueString } from '../KeyMap';
import { allMainStatKeys, allSubstatKeys, IArtifact, ICachedArtifact, ISubstat, MainStatKey, SubstatKey } from '../Types/artifact';
import { allArtifactRarities, allArtifactSets, allSlotKeys, ArtifactRarity, ArtifactSetKey, Rarity, SlotKey } from '../Types/consts';
import { clamp, hammingDistance, objectKeyMap } from '../Util/Util';
import { BorrowManager } from './BorrowManager';

const starColor = { r: 255, g: 204, b: 50 } //#FFCC32
const workerCount = 2

const schedulers = new BorrowManager(async (language): Promise<Scheduler> => {
  const scheduler = createScheduler()
  const promises = Array(workerCount).fill(0).map(async _ => {
    const worker = createWorker({
      errorHandler: console.error
    })

    await worker.load()
    await worker.loadLanguage(language)
    await worker.initialize(language)
    scheduler.addWorker(worker)
  })

  await Promise.any(promises)
  return scheduler
}, (_language, value) => {
  value.then(value => value.terminate())
})

export type ProcessedEntry = {
  fileName: string, imageURL: string, artifact: IArtifact, texts: Dict<keyof ICachedArtifact, Displayable>
}
export type OutstandingEntry = {
  file: File, fileName: string, imageURL?: Promise<string>, result?: Promise<{ file: File, result: ProcessedEntry }>
}
type Queue = { processed: ProcessedEntry[], outstanding: OutstandingEntry[] }
type UploadMessage = { type: "upload", files: OutstandingEntry[] }
type ProcessingMessage = { type: "processing" }
type ProcessedMessage = { type: "processed", file: File, result: ProcessedEntry }
type PopMessage = { type: "pop" }
type ClearMessage = { type: "clear" }
type Color = [number, number, number] // RGB
export const queueReducer = (queue: Queue, message: UploadMessage | ProcessingMessage | ProcessedMessage | PopMessage | ClearMessage): Queue => {
  switch (message.type) {
    case "upload": return { processed: queue.processed, outstanding: [...queue.outstanding, ...message.files] }
    case "processing": // Processing `outstanding` head. Refresh
      return { processed: queue.processed, outstanding: [...queue.outstanding] }
    case "processed":
      if (queue.outstanding[0].file === message.file)
        return { processed: [...queue.processed, message.result], outstanding: queue.outstanding.slice(1) }
      return queue // Not in the list, ignored
    case "pop": return { processed: queue.processed.slice(1), outstanding: queue.outstanding }
    case "clear": return { processed: [], outstanding: [] }
  }
}

export function processEntry(entry: OutstandingEntry) {
  if (entry.result) return

  const { file, fileName } = entry
  entry.imageURL = fileToURL(file)
  entry.result = entry.imageURL.then(async imageURL => {
    const sheets = await ArtifactSheet.getAll
    const ocrResult = await ocr(imageURL)

    const [artifact, texts] = findBestArtifact(
      sheets, ocrResult.rarities,
      parseSetKeys(ocrResult.artifactSetTexts, sheets),
      parseSlotKeys(ocrResult.whiteTexts),
      parseSubstats(ocrResult.substatTexts),
      parseMainStatKeys(ocrResult.whiteTexts),
      parseMainStatValues(ocrResult.whiteTexts)
    )

    return { file, result: { fileName, imageURL, artifact, texts } }
  })
}

const fileToURL = (file: File): Promise<string> => new Promise(resolve => {
  const reader = new FileReader()
  reader.onloadend = ({ target }) =>
    resolve(target!.result as string)
  reader.readAsDataURL(file)
})
const urlToImageData = (urlFile: string): Promise<ImageData> => new Promise(resolve => {
  const img = new Image()
  img.onload = ({ target }) =>
    resolve(imageToImageData(target as HTMLImageElement))
  img.src = urlFile
})
function imageToImageData(image: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas'), context = canvas.getContext('2d')!
  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0, image.width, image.height)
  return context.getImageData(0, 0, image.width, image.height) as ImageData // TODO: May be undefined
}
function imageDataToCanvas(imageData: ImageData) {
  // create off-screen canvas element
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height

  // update canvas with new data
  canvas.getContext('2d')!.putImageData(imageData, 0, 0)
  return canvas // produces a PNG file
}

async function ocr(imageURL: string): Promise<{ artifactSetTexts: string[], substatTexts: string[], whiteTexts: string[], rarities: Set<Rarity> }> {
  const imageData = await urlToImageData(imageURL)

  const width = imageData.width, halfHeight = Math.floor(imageData.height / 2)
  const bottomOpts = { rectangle: { top: halfHeight, left: 0, width, height: halfHeight } }

  const awaits = [
    textsFromImage(bandPass(imageData, [140, 140, 140], [255, 255, 255], { mode: "bw", region: "top" })), // slotkey, mainStatValue, level
    textsFromImage(bandPass(imageData, [30, 50, 80], [160, 160, 160], { region: "bot" }), bottomOpts), // substats
    textsFromImage(bandPass(imageData, [30, 160, 30], [200, 255, 200], { mode: "bw", region: "bot" }), bottomOpts), // artifact set, look for greenish texts
  ]

  const rarities = parseRarities(imageData.data, imageData.width, imageData.height)
  const [whiteTexts, substatTexts, artifactSetTexts] = await Promise.all(awaits)
  return { whiteTexts, substatTexts, artifactSetTexts, rarities }
}
async function textsFromImage(imageData: ImageData, options: object | undefined = undefined): Promise<string[]> {
  const canvas = imageDataToCanvas(imageData)
  const rec = await schedulers.borrow("eng", async (scheduler) =>
    await (await scheduler).addJob("recognize", canvas, options) as RecognizeResult)
  return rec.data.lines.map(line => line.text)
}

export function findBestArtifact(sheets: AllArtifactSheets, rarities: Set<number>, textSetKeys: Set<ArtifactSetKey>, slotKeys: Set<SlotKey>, substats: ISubstat[], mainStatKeys: Set<MainStatKey>, mainStatValues: { mainStatValue: number, unit?: string }[]): [IArtifact, Dict<keyof ICachedArtifact, Displayable>] {
  // const relevantSetKey = [...new Set<ArtifactSetKey>([...textSetKeys, "Adventurer", "ArchaicPetra"])]
  // TODO: restore
  const relevantSetKey = [...new Set<ArtifactSetKey>([...textSetKeys, "EmblemOfSeveredFate"])]

  let bestScore = -1, bestArtifacts: IArtifact[] = [{
    // setKey: "Adventurer", rarity: 3, level: 0, slotKey: "flower", mainStatKey: "hp", substats: [],
    // TODO: restore
    setKey: "EmblemOfSeveredFate", rarity: 3, level: 0, slotKey: "flower", mainStatKey: "hp", substats: [],
    location: "", lock: false, exclude: false,
  }]

  // Rate each rarity
  const rarityRates = objectKeyMap(allArtifactRarities, rarity => {
    let score = 0
    if (textSetKeys.size) {
      const count = [...textSetKeys].reduce((count, set) => count + (sheets(set).rarity.includes(rarity) ? 1 : 0), 0)
      score += count / textSetKeys.size
    }
    if (substats.length) {
      const count = substats.reduce((count, substat) =>
        count + (Artifact.getSubstatRolls(substat.key as SubstatKey, substat.value, rarity).length ? 1 : 0), 0)
      score += count / substats.length * 2
    }
    return score
  })

  // Test all *probable* combinations
  for (const slotKey of allSlotKeys) {
    for (const mainStatKey of Artifact.slotMainStats(slotKey)) {
      const mainStatScore = (slotKeys.has(slotKey) ? 1 : 0) + (mainStatKeys.has(mainStatKey) ? 1 : 0)
      const relevantMainStatValues = mainStatValues
        .filter(value => value.unit !== "%" || KeyMap.unit(mainStatKey) === "%") // Ignore "%" text if key isn't "%"
        .map(value => value.mainStatValue)

      for (const [rarityString, rarityIndividualScore] of Object.entries(rarityRates)) {
        const rarity = parseInt(rarityString) as ArtifactRarity
        const setKeys = relevantSetKey.filter(setKey => sheets(setKey).rarity.includes(rarity))
        const rarityScore = mainStatScore + rarityIndividualScore

        if (rarityScore + 2 < bestScore) continue // Early bail out

        for (const minimumMainStatValue of relevantMainStatValues) {
          const values = Artifact.mainStatValues(rarity, mainStatKey)
          const level = Math.max(0, values.findIndex(level => level >= minimumMainStatValue))
          const mainStatVal = values[level]
          const mainStatValScore = rarityScore + (mainStatVal === minimumMainStatValue ? 1 : 0)

          for (const setKey of setKeys) {
            const score = mainStatValScore + (textSetKeys.has(setKey) ? 1 : 0)
            if (score >= bestScore) {
              if (score > bestScore) bestArtifacts = []
              bestScore = score
              bestArtifacts.push({
                setKey, rarity, level, slotKey, mainStatKey, substats: [], location: "", lock: false, exclude: false,
              })
            }
          }
        }
        if (rarityScore >= bestScore) {
          const level = 0
          for (const setKey of setKeys) {
            const score = rarityScore + (textSetKeys.has(setKey) ? 1 : 0)

            if (score > bestScore) bestArtifacts = []
            bestScore = score
            bestArtifacts.push({
              setKey, rarity, level, slotKey, mainStatKey, substats: [], location: "", lock: false, exclude: false
            })
          }
        }
      }
    }
  }

  const texts = {} as Dict<keyof ICachedArtifact, Displayable>
  const chosen = {
    setKey: new Set(), rarity: new Set(), level: new Set(), slotKey: new Set(), mainStatKey: new Set(), mainStatVal: new Set(),
  } as Dict<keyof ICachedArtifact, Set<string>>

  const result = bestArtifacts[0], resultMainStatVal = Artifact.mainStatValue(result.mainStatKey, result.rarity, result.level)!
  result.substats = substats.filter((substat, i) =>
    substat.key !== result.mainStatKey &&
    substats.slice(0, i).every(other => other.key !== substat.key))
  for (let i = result.substats.length; i < 4; i++)
    result.substats.push({ key: "", value: 0 })

  for (const other of bestArtifacts) {
    chosen.setKey!.add(other.setKey)
    chosen.rarity!.add(other.rarity as any)
    chosen.level!.add(other.level as any)
    chosen.slotKey!.add(other.slotKey)
    chosen.mainStatKey!.add(other.mainStatKey)
  }

  function unknownText<T>(value: T, name: Displayable, text: (arg: T) => Displayable) {
    return <>Unknown {name} : Set to <ColorText color="error">{text(value)}</ColorText></>
  }
  function ambiguousText<T>(value: T, available: T[], name: Displayable, text: (arg: T) => Displayable) {
    return <>Ambiguous {name} <ColorText color="error">{text(value)}</ColorText> : May also be {
      available.filter(v => v !== value).map((value, index) => <><b>{index > 0 ? "/" : ""}</b><ColorText color="warning">{text(value)}</ColorText></>)}</>
  }
  function detectedText<T>(value: T, name: Displayable, text: (arg: T) => Displayable) {
    return <>Detected {name} <ColorText color="success">{text(value)}</ColorText></>
  }
  function inferredText<T>(value: T, name: Displayable, text: (arg: T) => Displayable) {
    return <>Inferred {name} <ColorText color="warning">{text(value)}</ColorText></>
  }

  function addText(key: keyof ICachedArtifact, available: Set<any>, name: Displayable, text: (value) => Displayable) {
    const recommended = new Set([...chosen[key]!].filter(value => available.has(value)))
    if (recommended.size > 1)
      texts[key] = ambiguousText(result[key], [...available], name, text)
    else if (recommended.size === 1)
      texts[key] = detectedText(result[key], name, text)
    else if (chosen[key]!.size > 1)
      texts[key] = unknownText(result[key], name, text)
    else
      texts[key] = inferredText(result[key], name, text)
  }

  addText("setKey", textSetKeys, "Set", (value) => sheets(value).name)
  addText("rarity", rarities, "Rarity", (value) => <>{value} {value !== 1 ? "Stars" : "Star"}</>)
  addText("slotKey", slotKeys, "Slot", (value) => <>{Artifact.slotName(value)}</>)
  addText("mainStatKey", mainStatKeys, "Main Stat", (value) => <>{KeyMap.getStr(value)}</>)
  texts.substats = <>{result.substats.filter(substat => substat.key !== "").map((substat, i) =>
    <div key={i}>{detectedText(substat, "Sub Stat", (value) => <>{KeyMap.getStr(value.key)}+{cacheValueString(value.value, KeyMap.unit(value.key))}{KeyMap.unit(value.key)}</>)}</div>)
  }</>

  const valueStrFunc = (value) => <>{cacheValueString(value, KeyMap.unit(result.mainStatKey))}{KeyMap.unit(result.mainStatKey)}</>
  if (mainStatValues.find(value => value.mainStatValue === resultMainStatVal)) {
    if (mainStatKeys.has(result.mainStatKey)) {
      texts.level = detectedText(result.level, "Level", (value) => "+" + value)
      texts.mainStatVal = detectedText(resultMainStatVal, "Main Stat value", valueStrFunc)
    } else {
      texts.level = inferredText(result.level, "Level", (value) => "+" + value)
      texts.mainStatVal = inferredText(resultMainStatVal, "Main Stat value", valueStrFunc)
    }
  } else {
    texts.level = unknownText(result.level, "Level", (value) => "+" + value)
    texts.mainStatVal = unknownText(resultMainStatVal, "Main Stat value", valueStrFunc)
  }

  return [result, texts]
}

function parseSetKeys(texts: string[], sheets: AllArtifactSheets): Set<ArtifactSetKey> {
  const results = new Set<ArtifactSetKey>([])
  for (const text of texts)
    for (const key of allArtifactSets)
      if (hammingDistance(text.replace(/\W/g, ''), sheets(key).nameRaw.replace(/\W/g, '')) <= 2)
        results.add(key)
  return results
}
function parseRarities(pixels: Uint8ClampedArray, width: number, height: number): Set<Rarity> {
  let d = pixels, lastRowNum = 0, rowsWithNumber = 0;
  const results = new Set<Rarity>([])
  for (let y = 0; y < height; y++) {
    let star = 0, onStar = false;
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4
      let r = d[i], g = d[i + 1], b = d[i + 2];
      if (colorCloseEnough({ r, g, b }, starColor)) {
        if (!onStar) {
          onStar = true
          star++
        }
      } else {
        onStar = false
      }
    }

    if (lastRowNum !== star) {
      lastRowNum = star
      rowsWithNumber = 1;
    } else if (lastRowNum) {
      rowsWithNumber++
      if (rowsWithNumber >= 10) results.add(clamp(lastRowNum, 3, 5) as Rarity)
    }
  }
  return results
}
function colorCloseEnough(color1, color2, threshold = 5) {
  const intCloseEnough = (a, b) => (Math.abs(a - b) <= threshold)
  return intCloseEnough(color1.r, color2.r) &&
    intCloseEnough(color1.g, color2.g) &&
    intCloseEnough(color1.b, color2.b)
}
function parseSlotKeys(texts: string[]): Set<SlotKey> {
  const results = new Set<SlotKey>()
  for (const text of texts)
    for (const key of allSlotKeys)
      if (hammingDistance(text.replace(/\W/g, ''), Artifact.slotName(key).replace(/\W/g, '')) <= 2)
        results.add(key)
  return results
}
function parseMainStatKeys(texts: string[]): Set<MainStatKey> {
  const results = new Set<MainStatKey>([])
  for (const text of texts)
    for (const key of allMainStatKeys) {
      if (text.toLowerCase().includes(KeyMap.getStr(key)?.toLowerCase() ?? ""))
        results.add(key)
      //use fuzzy compare on the ... Bonus texts. heal_ is included.
      if (key.includes("_bonu") && hammingDistance(text.replace(/\W/g, ''), (KeyMap.getStr(key) ?? "").replace(/\W/g, '')) <= 1)
        results.add(key)
    }
  return results
}
function parseMainStatValues(texts: string[]): { mainStatValue: number, unit?: string }[] {
  const results: { mainStatValue: number, unit?: string }[] = []
  for (const text of texts) {
    let regex = /(\d+[,|\\.]+\d)%/
    let match = regex.exec(text)
    if (match) results.push({ mainStatValue: parseFloat(match[1].replace(/,/g, ".").replace(/\.{2,}/g, ".")), unit: "%" })
    regex = /(\d+[,|\\.]\d{3}|\d{2,3})/
    match = regex.exec(text)
    if (match) results.push({ mainStatValue: parseInt(match[1].replace(/[,|\\.]+/g, "")) })
  }
  return results
}
function parseSubstats(texts: string[]): ISubstat[] {
  const matches: ISubstat[] = []
  for (let text of texts) {
    text = text.replace(/^[\W]+/, "").replace(/\n/, "")
    //parse substats
    allSubstatKeys.forEach(key => {
      const name = KeyMap.getStr(key)
      const regex = KeyMap.unit(key) === "%" ?
        new RegExp(name + "\\s*\\+\\s*(\\d+[\\.|,]+\\d)%", "im") :
        new RegExp(name + "\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)", "im")
      const match = regex.exec(text)
      if (match)
        matches.push({ key, value: parseFloat(match[1].replace(/,/g, ".").replace(/\.{2,}/g, ".")) })
    })
  }
  return matches.slice(0, 4)
}

function bandPass(pixelData: ImageData, color1: Color, color2: Color, options: { region?: "top" | "bot" | "all", mode?: "bw" | "color" | "invert" }) {
  const { region = "all", mode = "color" } = options
  const d = Uint8ClampedArray.from(pixelData.data)
  const top = region === "top", bot = region === "bot", all = region === "all"
  const bw = mode === "bw", invert = mode === "invert"
  const halfInd = Math.floor(pixelData.width * (pixelData.height / 2) * 4)
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    if ((all || (top && i < halfInd) || (bot && i > halfInd)) &&
      r >= color1[0] && r <= color2[0] &&
      g >= color1[1] && g <= color2[1] &&
      b >= color1[2] && b <= color2[2]) {
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
