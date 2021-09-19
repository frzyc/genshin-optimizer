import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useReducer, useState } from 'react';
import { Button, Card, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
import { createScheduler, createWorker, RecognizeResult, Scheduler } from 'tesseract.js';
import usePromise from '../ReactHooks/usePromise';
import Stat from '../Stat';
import { allMainStatKeys, allSubstats, IArtifact, ICachedArtifact, ISubstat, MainStatKey, SubstatKey } from '../Types/artifact';
import { allArtifactRarities, allArtifactSets, allSlotKeys, ArtifactRarity, ArtifactSetKey, Rarity, SlotKey } from '../Types/consts';
import { BorrowManager } from '../Util/BorrowManager';
import { valueStringWithUnit } from '../Util/UIUtil';
import { clamp, hammingDistance, objectFromKeyMap } from '../Util/Util';
import Artifact from './Artifact';
import { ArtifactSheet } from './ArtifactSheet';
import scan_art_main from "./imgs/scan_art_main.png";
import Snippet from "./imgs/snippet.png";

const starColor = { r: 255, g: 204, b: 50 } //#FFCC32
const maxProcessingCount = 3, maxProcessedCount = 16, workerCount = 2

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

export default function UploadDisplay({ setState, setReset, artifactInEditor }: { setState: (art: IArtifact) => void, setReset: (reset: () => void) => void, artifactInEditor: boolean }) {
  const [modalShow, setModalShow] = useState(false)

  const [{ processed, outstanding }, dispatchQueue] = useReducer(queueReducer, { processed: [], outstanding: [] })
  const firstProcessed = processed[0] as ProcessedEntry | undefined
  const firstOutstanding = outstanding[0] as OutstandingEntry | undefined

  const processingImageURL = usePromise(firstOutstanding?.imageURL, [firstOutstanding?.imageURL])
  const processingResult = usePromise(firstOutstanding?.result, [firstOutstanding?.result])

  const remaining = processed.length + outstanding.length

  const image = firstProcessed?.imageURL ?? processingImageURL
  const { artifact, texts } = firstProcessed ?? {}
  const fileName = firstProcessed?.fileName ?? firstOutstanding?.fileName ?? "Click here to upload Artifact screenshot files"

  useEffect(() => {
    if (!artifactInEditor && artifact)
      setState(artifact)
  }, [artifactInEditor, artifact, setState])

  useEffect(() => {
    const numProcessing = Math.min(maxProcessedCount - processed.length, maxProcessingCount, outstanding.length)
    const processingCurrent = numProcessing && !outstanding[0].result
    outstanding.slice(0, numProcessing).forEach(processEntry)
    if (processingCurrent)
      dispatchQueue({ type: "processing" })
  }, [processed.length, outstanding])

  useEffect(() => {
    if (processingResult)
      dispatchQueue({ type: "processed", ...processingResult })
  }, [processingResult, dispatchQueue])

  const removeCurrent = useCallback(() => dispatchQueue({ type: "pop" }), [dispatchQueue])
  const uploadFiles = useCallback((files: FileList) =>
    dispatchQueue({ type: "upload", files: [...files].map(file => ({ file, fileName: file.name })) }), [dispatchQueue])
  const clearQueue = useCallback(() => dispatchQueue({ type: "clear" }), [dispatchQueue])

  useEffect(() => {
    const pasteFunc = (e: any) => uploadFiles(e.clipboardData.files)
    window.addEventListener('paste', pasteFunc);
    setReset?.(removeCurrent);
    return () =>
      window.removeEventListener('paste', pasteFunc)
  }, [setReset, removeCurrent, uploadFiles])

  const img = image && <img src={image} className="w-100 h-auto" alt="Screenshot to parse for artifact values" />
  return (<Row>
    <ExplainationModal modalShow={modalShow} hide={() => setModalShow(false)} />
    <Col xs={12} className="mb-2">
      <Row>
        <Col>
          <h6 className="mb-0">Parse Artifact by Uploading Image</h6>
        </Col>
        <Col xs="auto"><Button variant="info" size="sm" onClick={() => {
          setModalShow(true)
          ReactGA.modalview('/artifact/how-to-upload')
        }}>Show Me How!</Button></Col>
      </Row>
    </Col>
    {remaining > 0 && <Col xs={12}>
      <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
        <Row>
          <Col className="p-1 ml-2">Screenshots in file-queue: <b>{remaining}</b>{process.env.NODE_ENV === "development" &&
            ` (Debug: Processed ${processed.length}/${maxProcessedCount}, Processing: ${outstanding.filter(entry => entry.result).length}/${maxProcessingCount}, Outstanding: ${outstanding.length})`}</Col>
          <Col xs="auto"><Button size="sm" variant="danger" onClick={clearQueue}>Clear file-queue</Button></Col>
        </Row>
      </Card>
    </Col>}
    <Col xs={8} lg={image ? 4 : 0}>{img}</Col>
    <Col xs={12} lg={image ? 8 : 12}>
      {!firstProcessed && firstOutstanding &&
        <div className="mb-2">
          <h6 className="mb-0">Scanning current artifact</h6>
          <ProgressBar animated now={100} />
        </div>}
      <Form.File
        type="file"
        className="mb-0"
        label={fileName}
        onChange={e => {
          uploadFiles(e.target.files)
          e.target.value = null // reset the value so the same file can be uploaded again...
        }}
        accept="image/*"
        custom
        multiple
      />
      {texts && <div className="mb-2">
        <div>{texts.slotKey}</div>
        <div>{texts.mainStatKey}</div>
        <div>{texts.mainStatVal}</div>
        <div>{texts.rarity}</div>
        <div>{texts.level}</div>
        <div>{texts.substats}</div>
        <div>{texts.setKey}</div>
      </div>}
      {Boolean(!image) && <Form.Label className="mb-0">Please Select an Image, or paste a screenshot here (Ctrl+V)</Form.Label>}
    </Col>
  </Row >)
}
function ExplainationModal({ modalShow, hide }: { modalShow: boolean, hide: () => void }) {
  return <Modal show={modalShow} onHide={hide} size="xl" variant="success" contentClassName="bg-transparent">
    <Card bg="darkcontent" text={"lightfont" as any} >
      <Card.Header>
        <Row>
          <Col><Card.Title>How do Upload Screenshots for parsing</Card.Title></Col>
          <Col xs="auto">
            <Button variant="danger" onClick={hide} >
              <FontAwesomeIcon icon={faTimes} /></Button>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <h5 className="text-warning">NOTE: Artifact Scanning currently only work for ENGLISH artifacts.</h5>
        <Row>
          <Col xs={8} md={4}>
            <img alt="snippet of the screen to take" src={Snippet} className="w-100 h-auto" />
          </Col>
          <Col xs={12} md={8}>
            <p>Using screenshots can dramatically decrease the amount of time you manually input in stats on the Genshin Optimizer.</p>
            <h5>Where to snip the screenshot.</h5>
            <p>In game, Open your bag, and navigate to the artifacts tab. Select the artifact you want to scan with Genshin Optimizer. <b>Only artifact from this screen can be scanned.</b></p>
            <h6>Single artifact</h6>
            <p>To take a screenshot, in Windows, the shortcut is <strong>Shift + WindowsKey + S</strong>. Once you selected the region, the image is automatically included in your clipboard.</p>
            <h6>Multiple artifacts</h6>
            <p>To take advantage of batch uploads, you can use a tool like <a href="https://picpick.app/" target="_blank" rel="noreferrer">PicPick</a> to create a macro to easily to screenshot a region to screenshot multiple artifacts at once.</p>
            <h5>What to include in the screenshot.</h5>
            <p>As shown in the Image, starting from the top with the artifact name, all the way to the set name(the text in green). </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <h5>Adding Screenshot to Genshin Optimizer</h5>
            <p>At this point, you should have the artifact snippet either saved to your harddrive, or in your clipboard.</p>
            <p className="mb-0">You can click on the box next to "Browse" to browse the files in your harddrive for multiple screenshots.</p>
            <p>For single screenshots from the snippets, just press <strong>Ctrl + V</strong> to paste from your clipboard.</p>
            <p>You should be able to see a Preview of your artifact snippet, and after waiting a few seconds, the artifact set and the substats will be filled in in the <b>Artifact Editor</b>.
            </p>
          </Col>
          <Col xs={12}>
            <h5>Finishing the Artifact</h5>
            <p>Unfortunately, computer vision is not 100%. There will always be cases where something is not scanned properly. You should always double check the scanned artifact values! Once the artifact has been filled, Click on <strong>Add Artifact</strong> to finish editing the artifact.</p>
            <img alt="main screen after importing stats" src={scan_art_main} className="w-75 h-auto" />
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer>
        <Button variant="danger" onClick={hide}>
          <span>Close</span>
        </Button>
      </Card.Footer>
    </Card>
  </Modal>
}

const queueReducer = (queue: Queue, message: UploadMessage | ProcessingMessage | ProcessedMessage | PopMessage | ClearMessage): Queue => {
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

function processEntry(entry: OutstandingEntry) {
  if (entry.result) return

  const { file, fileName } = entry
  entry.imageURL = fileToURL(file)
  entry.result = entry.imageURL.then(async imageURL => {
    const sheets = await ArtifactSheet.getAll()
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

export function findBestArtifact(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, rarities: Set<number>, textSetKeys: Set<ArtifactSetKey>, slotKeys: Set<SlotKey>, substats: ISubstat[], mainStatKeys: Set<MainStatKey>, mainStatValues: { mainStatValue: number, unit?: string }[]): [IArtifact, Dict<keyof ICachedArtifact, Displayable>] {
  const relevantSetKey = [...new Set<ArtifactSetKey>([...textSetKeys, "Adventurer", "ArchaicPetra"])]

  let bestScore = -1, bestArtifacts: IArtifact[] = [{
    setKey: "Adventurer", rarity: 3, level: 0, slotKey: "flower", mainStatKey: "hp", substats: [],
    location: "", lock: false, exclude: false,
  }]

  // Rate each rarity
  const rarityRates = objectFromKeyMap(allArtifactRarities, rarity => {
    let score = 0
    if (textSetKeys.size) {
      const count = [...textSetKeys].reduce((count, set) => count + (sheets[set].rarity.includes(rarity) ? 1 : 0), 0)
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
        .filter(value => value.unit !== "%" || Stat.getStatUnit(mainStatKey) === "%") // Ignore "%" text if key isn't "%"
        .map(value => value.mainStatValue)

      for (const [rarityString, rarityIndividualScore] of Object.entries(rarityRates)) {
        const rarity = parseInt(rarityString) as ArtifactRarity
        const setKeys = relevantSetKey.filter(setKey => sheets[setKey].rarity.includes(rarity))
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
    return <>Unknown {name} : Set to <span className="text-danger">{text(value)}</span></>
  }
  function ambiguousText<T>(value: T, available: T[], name: Displayable, text: (arg: T) => Displayable) {
    return <>Ambiguous {name} <span className="text-danger">{text(value)}</span> : May also be {
      available.filter(v => v !== value).map((value, index) => <><b>{index > 0 ? "/" : ""}</b><span className="text-warning">{text(value)}</span></>)}</>
  }
  function detectedText<T>(value: T, name: Displayable, text: (arg: T) => Displayable) {
    return <>Detected {name} <span className="text-success">{text(value)}</span></>
  }
  function inferredText<T>(value: T, name: Displayable, text: (arg: T) => Displayable) {
    return <>Inferred {name} <span className="text-warning">{text(value)}</span></>
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

  addText("setKey", textSetKeys, "Set", (value) => sheets[value].name)
  addText("rarity", rarities, "Rarity", (value) => <>{value} {value !== 1 ? "Stars" : "Star"}</>)
  addText("slotKey", slotKeys, "Slot", (value) => <>{Artifact.slotName(value)}</>)
  addText("mainStatKey", mainStatKeys, "Main Stat", (value) => <>{Stat.getStatNameRaw(value)}</>)
  texts.substats = <>{result.substats.filter(substat => substat.key !== "").map((substat, i) =>
    <div key={i}>{detectedText(substat, "Sub Stat", (value) => <>{Stat.getStatNameRaw(value.key)}+{valueStringWithUnit(value.value, Stat.getStatUnit(value.key))}</>)}</div>)
  }</>

  const unit = Stat.getStatUnit(result.mainStatKey)
  if (mainStatValues.find(value => value.mainStatValue === resultMainStatVal)) {
    if (mainStatKeys.has(result.mainStatKey)) {
      texts.level = detectedText(result.level, "Level", (value) => "+" + value)
      texts.mainStatVal = detectedText(resultMainStatVal, "Main Stat value", (value) => <>{valueStringWithUnit(value, unit)}</>)
    } else {
      texts.level = inferredText(result.level, "Level", (value) => "+" + value)
      texts.mainStatVal = inferredText(resultMainStatVal, "Main Stat value", (value) => <>{valueStringWithUnit(value, unit)}</>)
    }
  } else {
    texts.level = unknownText(result.level, "Level", (value) => "+" + value)
    texts.mainStatVal = unknownText(resultMainStatVal, "Main Stat value", (value) => <>{valueStringWithUnit(value, unit)}</>)
  }

  return [result, texts]
}

function parseSetKeys(texts: string[], sheets): Set<ArtifactSetKey> {
  const results = new Set<ArtifactSetKey>([])
  for (const text of texts)
    for (const key of allArtifactSets)
      if (hammingDistance(text.replace(/\W/g, ''), sheets[key].nameRaw.replace(/\W/g, '')) <= 2)
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
      if (text.toLowerCase().includes(Stat.getStatNameRaw(key).toLowerCase()))
        results.add(key)
      //use fuzzy compare on the ... Bonus texts. heal_ is included.
      if (key.includes("_bonu") && hammingDistance(text.replace(/\W/g, ''), Stat.getStatNameRaw(key).replace(/\W/g, '')) <= 1)
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
    allSubstats.forEach(key => {
      const name = Stat.getStatNameRaw(key)
      const regex = Stat.getStatUnit(key) === "%" ?
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

type ProcessedEntry = {
  fileName: string, imageURL: string, artifact: IArtifact, texts: Dict<keyof ICachedArtifact, Displayable>
}
type OutstandingEntry = {
  file: File, fileName: string, imageURL?: Promise<string>, result?: Promise<{ file: File, result: ProcessedEntry }>
}
type Queue = { processed: ProcessedEntry[], outstanding: OutstandingEntry[] }
type UploadMessage = { type: "upload", files: OutstandingEntry[] }
type ProcessingMessage = { type: "processing" }
type ProcessedMessage = { type: "processed", file: File, result: ProcessedEntry }
type PopMessage = { type: "pop" }
type ClearMessage = { type: "clear" }
type Color = [number, number, number] // RGB
