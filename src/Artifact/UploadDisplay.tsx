import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
import Tesseract, { createWorker } from 'tesseract.js';
import scan_art_main from "./imgs/scan_art_main.png";
import Snippet from "./imgs/snippet.png";
import Stat from '../Stat';
import { clamp, hammingDistance } from '../Util/Util';
import Artifact from './Artifact';
import { allMainStatKeys, IArtifact, MainStatKey, Substat, SubstatKey } from '../Types/artifact';
import { allArtifactSets, allRarities, allSlotKeys, SlotKey } from '../Types/consts';
import { ArtifactSheet } from './ArtifactSheet';

const starColor = { r: 255, g: 204, b: 50 } //#FFCC32
const zeroProgress = { now: 0, variant: "" }

export default function UploadDisplay({ setState, setReset, artifactInEditor }) {
  const [fileList, setFileList] = useState([] as { name: string }[])
  const [fileName, setFileName] = useState("Click here to Upload Artifact Screenshot File");
  const [image, setImage] = useState('');

  const [scanning, setScanning] = useState(false)
  const [otherProgress, setOtherProgress] = useState(zeroProgress);
  const [substatProgress, setSubstatProgress] = useState(zeroProgress);
  const [artSetProgress, setArtSetProgress] = useState(zeroProgress);
  const [texts, setTexts] = useState({} as Dict<keyof IArtifact, Displayable>)

  const [modalShow, setModalShow] = useState(false)
  const resetText = () => setTexts({})
  const scanFile = useCallback(
    async () => {
      if (!fileList.length) return
      const [file, ...rest] = fileList
      setFileList(rest)
      if (!file) return
      setScanning(true)
      resetText()
      setFileName(file.name)
      const urlFile = await fileToURL(file)
      setImage(urlFile)
      const [artifact, texts] = await artifactFromImage(
        urlFile,
        setOtherProgress,
        setSubstatProgress,
        setArtSetProgress
      )

      setTexts(texts)
      setState?.(artifact)
    }, [fileList, setState])

  const resetState = useCallback(
    () => {
      setFileName("Click here to Upload Artifact Screenshot File")
      setImage("")
      setModalShow(false)
      setScanning(false)

      setOtherProgress(zeroProgress)
      setSubstatProgress(zeroProgress)
      setArtSetProgress(zeroProgress)
      resetText();
      //scan the next file
      scanFile();
    }, [scanFile])

  const uploadFiles = useCallback(
    (files) => setFileList([...fileList, ...files]), [fileList])
  useEffect(() => {
    const pasteFunc = e =>
      uploadFiles(e.clipboardData.files)
    window.addEventListener('paste', pasteFunc);
    setReset?.(resetState);
    return () =>
      window.removeEventListener('paste', pasteFunc)
  }, [setReset, resetState, uploadFiles])

  useEffect(() => {
    if (!scanning && !artifactInEditor) scanFile()
  }, [scanning, artifactInEditor, fileList, scanFile])

  const img = Boolean(image) && <img src={image} className="w-100 h-auto" alt="Screenshot to parse for artifact values" />
  return (<Row>
    <ExplainationModal {...{ modalShow, hide: () => setModalShow(false) }} />
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
    {Boolean(fileList.length) && <Col xs={12}>
      <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
        <Row>
          <Col className="p-1 ml-2">Screenshots in file-queue: <b>{fileList.length}</b></Col>
          <Col xs="auto"><Button size="sm" variant="danger" onClick={() => setFileList([])}>Clear file-queue</Button></Col>
        </Row>
      </Card>
    </Col>}
    <Col xs={8} lg={image ? 4 : 0}>{img}</Col>
    <Col xs={12} lg={image ? 8 : 12}>
      {scanning && <>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${artSetProgress.now < 100 ? "ning" : "ned"} Artifact Set`}</h6>
          <ProgressBar {...artSetProgress} label={`${artSetProgress.now.toFixed(1)}%`} />
        </div>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${substatProgress.now < 100 ? "ning" : "ned"} Artifact Substat`}</h6>
          <ProgressBar {...substatProgress} label={`${substatProgress.now.toFixed(1)}%`} />
        </div>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${otherProgress.now < 100 ? "ning" : "ned"} Other`}</h6>
          <ProgressBar {...otherProgress} label={`${otherProgress.now.toFixed(1)}%`} />
        </div>
        <div className="mb-2">
          <div>{texts.numStars ?? ""}</div>
          <div>{texts.setKey ?? ""}</div>
          <div>{texts.slotKey ?? ""}</div>
          <div>{texts.mainStatVal ?? ""}</div>
          <div>{texts.mainStatKey ?? ""}</div>
          <div>{texts.level ?? ""}</div>
          <div>{texts.substats ?? ""}</div>
        </div>
      </>}
      <Form.File
        type="file"
        className="mb-0"
        label={fileName}
        onChange={e => {
          uploadFiles(e.target.files)
          e.target.value = null//reset the value so the same file can be uploaded again...
        }}
        accept="image/*"
        custom
        multiple
      />
      {Boolean(!image) && <Form.Label className="mb-0">Please Select an Image, or paste a screenshot here (Ctrl+V)</Form.Label>}
    </Col>
  </Row >)
}
function ExplainationModal({ modalShow, hide }) {
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

let reader = new FileReader()
function fileToURL(file): Promise<string> {
  return new Promise(resolve => {
    // let reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string); // TODO: May not be string
    }
    reader.readAsDataURL(file)
  })
}
function urlToImageData(urlFile: string): Promise<ImageData> {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = () =>
      resolve(getImageData(img))
    img.src = urlFile
  })
}

function getImageData(image: HTMLImageElement): ImageData {
  const tempCanvas = document.createElement('canvas'),
    tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx?.drawImage(image, 0, 0, image.width, image.height);
  const imageDataObj = tempCtx?.getImageData(0, 0, image.width, image.height) as ImageData; // TODO: May be undefined
  return imageDataObj
}

function imageDataToURL(imageDataObj: ImageData) {
  // create off-screen canvas element
  let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

  canvas.width = imageDataObj.width;
  canvas.height = imageDataObj.height;

  // create imageData object
  let idata = ctx?.createImageData(imageDataObj.width, imageDataObj.height) as ImageData; // TODO: May be null

  // set our buffer as source
  idata.data.set(imageDataObj.data);

  // update canvas with new data
  ctx?.putImageData(idata, 0, 0);

  let dataUri = canvas.toDataURL(); // produces a PNG file

  return dataUri
}

function starScanning(pixels: Uint8ClampedArray, width: number, height: number, defVal = 0) {
  let d = pixels, lastRowNum = 0, rowsWithNumber = 0;
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
      if (rowsWithNumber >= 10) return lastRowNum
    }
  }
  return defVal
}

function colorCloseEnough(color1, color2, threshold = 5) {
  const intCloseEnough = (a, b) => (Math.abs(a - b) <= threshold)
  return intCloseEnough(color1.r, color2.r) &&
    intCloseEnough(color1.g, color2.g) &&
    intCloseEnough(color1.b, color2.b)
}

function parseSubstat(texts: string[]): Substat[] | null {
  let matches: { value: string | number, unit: string, key: SubstatKey }[] = []
  for (let text of texts) {
    text = text.replace(/^[\W]+/, "").replace(/\n/, "")
    //parse substats
    Artifact.getSubstatKeys().forEach(key => {
      let regex: RegExp
      let unit = Stat.getStatUnit(key)
      let name = Stat.getStatNameRaw(key)
      if (unit === "%") regex = new RegExp(name + "\\s*\\+\\s*(\\d+[\\.|,]+\\d)%", "im");
      else regex = new RegExp(name + "\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)", "im");
      let match = regex.exec(text)
      match && matches.push({ value: match[1].replace(/,/g, ".").replace(/\.{2,}/g, "."), unit, key })
    })
  }
  matches.forEach((match, i) => {
    if (i >= 4) return;//this shouldn't happen, just in case
    match.value = match.unit === "%" ? parseFloat(match.value as string) : parseInt(match.value as string)
  })
  let substats: Substat[] = []
  for (let i = 0; i < 4; i++) {
    if (matches[i]) substats.push({ key: matches[i].key, value: matches[i].value as number })
    else substats.push({ key: "", value: 0 })
  }
  return substats
}
function parseMainStatKey(texts: string[]): MainStatKey | "def" | "" {
  for (const text of texts)
    for (const key of allMainStatKeys) {
      if (text.toLowerCase().includes(Stat.getStatNameRaw(key).toLowerCase()))
        return key
      //use fuzzy compare on the ... Bonus texts. heal_ is included.
      if (key.includes("_bonu") && hammingDistance(text.replace(/\W/g, ''), Stat.getStatNameRaw(key).replace(/\W/g, '')) <= 1)
        return key
    }
  return ""
}
function parseSetKey(texts: string[], sheets, defVal = "") {
  //parse for sets
  for (const text of texts)
    for (const key of allArtifactSets)
      if (hammingDistance(text.replace(/\W/g, ''), sheets[key].name.replace(/\W/g, '')) <= 2)
        return key
}
function parseSlotKey(texts: string[]): SlotKey | undefined {
  //parse for slot
  for (const text of texts)
    for (const key of allSlotKeys)
      if (hammingDistance(text.replace(/\W/g, ''), Artifact.slotName(key).replace(/\W/g, '')) <= 2)
        return key;
}
// function parseLevel(text) {
//   let regex = /\+(\d{1,2})/
//   let match = regex.exec(text)
//   if (match) return parseInt(match[1])
//   return NaN
// }
function parseMainStatvalue(texts: string[]): { mainStatValue: number, unit?: string } {
  for (const text of texts) {
    let regex = /(\d+[,|\\.]+\d)%/
    let match = regex.exec(text)
    if (match) return { mainStatValue: parseFloat(match[1].replace(/,/g, ".").replace(/\.{2,}/g, ".")), unit: "%" }
    regex = /(\d+[,|\\.]\d{3}|\d{2,3})/
    match = regex.exec(text)
    if (match) return { mainStatValue: parseInt(match[1].replace(/[,|\\.]+/g, "")) }
  }
  return { mainStatValue: NaN }
}

async function artifactFromImage(urlFile: string, setOtherProgress, setSubstatProgress, setArtSetProgress): Promise<[IArtifact, Dict<keyof IArtifact, Displayable>]> {
  const texts = {} as Dict<keyof IArtifact, Displayable>
  const imageDataObj = await urlToImageData(urlFile)
  const awaits = [
    // slotkey, mainStatValue, level
    linesFromImage(bandPass(imageDataObj, [140, 140, 140], [255, 255, 255], { region: "top", mode: "bw" }), setOtherProgress),
    // substats
    linesFromImage(bandPass(imageDataObj, [30, 50, 80], [160, 160, 160], { region: "bot" }), setSubstatProgress),
    // artifact set, look for greenish texts
    linesFromImage(bandPass(imageDataObj, [30, 160, 30], [200, 255, 200], { region: "bot", mode: "bw" }), setArtSetProgress),
  ]
  let numStars = clamp(starScanning(imageDataObj.data, imageDataObj.width, imageDataObj.height, 5), 3, 5)
  let numStarsText = <span>Detected <span className="text-success">{numStars}</span> Stars.</span>

  const sheets = await ArtifactSheet.getAll()
  let [whiteTexts, substatTexts, artifactSetTexts] = await Promise.all(awaits)

  let setKey = parseSetKey(artifactSetTexts.map(x => x.text), sheets)
  let slotKey = parseSlotKey(whiteTexts.map(x => x.text))
  let substats = parseSubstat(substatTexts.map(x => x.text))
  let level = NaN//looks like the level isnt consistently parsed.
  let mainStatKey = parseMainStatKey(whiteTexts.map(x => x.text))
  let { mainStatValue, unit = "" } = parseMainStatvalue(whiteTexts.map(x => x.text))

  const sheet = setKey ? sheets[setKey] : undefined

  if (mainStatValue)
    texts.mainStatVal = <span>Detected Main Stat value to be <span className="text-success">{mainStatValue}{unit}</span>.</span>
  else
    texts.mainStatVal = <span className="text-warning">Could not detect main stat value.</span>
  //the main stat value is used to distinguish main stats between % and flat
  if (mainStatKey === "hp" || mainStatKey === "def" || mainStatKey === "atk")
    if (unit === "%" || (slotKey && Artifact.slotMainStats(slotKey).includes(`${mainStatKey}_` as MainStatKey)))
      mainStatKey = `${mainStatKey}_` as any
  if (slotKey && !Artifact.slotMainStats(slotKey).includes(mainStatKey as any))
    mainStatKey = ""

  if (mainStatKey)
    texts.mainStatKey = <span>Detected main stat: <span className="text-success">{Stat.getStatNameRaw(mainStatKey)}</span></span>

  if (setKey && numStars)
    if (!sheet?.rarity.includes(numStars)) {
      numStars = sheet?.rarity[0] ?? 4
      numStarsText = <span className="text-danger">Could not detect artifact rarity.</span>
    }

  //if main stat isnt parsed, then we try to guess it
  if (slotKey && !mainStatKey) {
    let stats = Artifact.slotMainStats(slotKey)
    if (stats.length === 1) {
      mainStatKey = stats[0]
      texts.mainStatKey = <span className="text-warning">Main stat was not successfully detected. Since artifact is of "{Artifact.slotName(slotKey)}", main stat: <span className="text-danger">{Stat.getStatName(mainStatKey)}</span>.</span>
    } else {
      stats = stats.filter(stat => {
        if (mainStatValue && unit !== Stat.getStatUnit(stat)) return false
        if (substats && substats.some(substat => substat.key === stat)) return false
        if (mainStatValue && numStars && level && Artifact.mainStatValue(stat, numStars, level) !== mainStatValue) return false
        return true
      });
      if (stats.length > 0) {
        mainStatKey = stats[0]
        texts.mainStatKey = <span className="text-warning">Main stat was not successfully detected. Inferring main stat: <span className="text-danger">{Stat.getStatName(mainStatKey)}</span>.</span>
      }
    }
  }

  let guessLevel = (nStars, mainSKey, mainSVal) => {
    //if level isn't parsed, then we try to guess it
    let mainStatValues = Artifact.mainStatValues(nStars, mainSKey.includes("ele_dmg_") ? "ele_dmg_" : mainSKey)
    if (mainStatValues.length > 0) {
      let isFloat = Stat.getStatUnit(mainSKey) === "%"
      let testLevel = mainStatValues.findIndex(val => isFloat ? (Math.abs(mainSVal - val) < 0.1) : (mainSVal === val))
      if (testLevel !== -1) {
        level = testLevel
        return true
      }
    }
    return false
  }
  //guess level when we have all the stats
  if (isNaN(level) && numStars && mainStatKey && mainStatValue)
    guessLevel(numStars, mainStatKey, mainStatValue)
  let detectedlevel = !isNaN(level)
  if (!isNaN(level)) texts.level = <span>Detected level: <span className="text-success">{level}</span></span>

  //try to guess the level when we only have mainStatKey and mainStatValue
  if (isNaN(level) && mainStatKey && mainStatValue) {
    let stars = sheet?.rarity ?? allRarities
    for (const nStar of stars)
      if (guessLevel(nStar, mainStatKey, mainStatValue)) {
        if (sheet?.rarity.includes(nStar) ?? true) {
          numStars = nStar
          numStarsText = <span className="text-warning">Inferred <span className="text-success">{numStars}</span> Stars from Artifact Set.</span>
          break;
        }
      }
  }
  if (!isNaN(level) && !detectedlevel) texts.level = <span className="text-warning">Inferred level: <span className="text-danger">{level}</span></span>

  //check level validity against numStars
  if (numStars && !isNaN(level))
    if (level > numStars * 4)
      level = NaN

  //check if the final star values are valid
  numStars = clamp(numStars, 3, 5)

  //if the level is not parsed at all after all the prevous steps, default it to the highest level of the star value
  if (isNaN(level)) {
    level = numStars * 4
    texts.level = <span className="text-warning">Could not detect artifact level. Default to: <span className="text-danger">{level}</span></span>
  }


  //try to infer slotKey if could not be detected.
  if (slotKey) {
    texts.slotKey = <span>Detected slot name <span className="text-success">{Artifact.slotName(slotKey)}</span></span>
  } else if (mainStatKey) {
    //infer slot name from main stat
    let pieces = setKey ? Object.keys(sheet!.slotNames) as SlotKey[] : allSlotKeys
    for (const testSlotKey of pieces) {
      if (Artifact.slotMainStats(testSlotKey).includes(mainStatKey as any)) {
        slotKey = testSlotKey;
        texts.slotKey = <span className="text-warning">Slot name was not successfully detected. Inferring slot name: <span className="text-danger">{Artifact.slotName(slotKey)}</span>.</span>
        break;
      }
    }
  }

  let state: Partial<IArtifact> = {}
  if (!isNaN(level)) state.level = level
  else state.level = 0

  if (setKey) {
    state.setKey = setKey as any
    texts.setKey = <span>Detected set <span className="text-success">{sheet?.name}</span></span>
  } else {
    texts.setKey = <span className="text-danger">Could not detect artifact set name.</span>
    state.setKey = "ArchaicPetra"
  }

  if (slotKey) {
    state.slotKey = slotKey
  } else {
    texts.slotKey = <span className="text-danger">Could not detect slot name.</span>
    state.slotKey = "circlet"
  }

  if (substats) {
    state.substats = substats
    let len = substats.reduce((accu, substat) => accu + (substat.key ? 1 : 0), 0)
    let { low } = Artifact.rollInfo(numStars)
    if (numStars && len < low)
      texts.substats = <span className="text-warning">Detected {len} substats, but there should be at least {low} substats.</span>
    else
      texts.substats = <span>Detected <span className="text-success">{len}</span> substats.</span>
  } else {
    texts.substats = <span className="text-danger">Could not detect any substats.</span>
    state.substats = []
  }
  for (let i = state.substats!.length; i < 4; i++)
    state.substats.push({ key: "", value: 0 })

  if (numStars) {
    state.numStars = numStars
    texts.numStars = numStarsText
  } else {
    state.numStars = sheet?.rarity[0] ?? 4
  }
  if (mainStatKey) {
    state.mainStatKey = mainStatKey as any
  } else {
    texts.mainStatKey = <span className="text-danger">Could not detect main stat.</span>
    state.mainStatKey = Artifact.slotMainStats(state.slotKey)[0]
  }

  return [state as IArtifact, texts]
}

async function linesFromImage(imageDataObj: ImageData, setProgress): Promise<Tesseract.Line[]> {
  const tworker = createWorker({
    logger: ({ progress, status }) => {
      if (status === "loading tesseract core")
        setProgress({ now: progress * 5 + 0, variant: "danger" })
      else if (status.includes("loading language traineddata"))
        setProgress({ now: progress * 5 + 5, variant: "warning" })
      else if (status.includes("initializing api"))
        setProgress({ now: progress * 5 + 10, variant: "info" })
      else if (status === "recognizing text")
        setProgress({ now: progress * 85 + 15, variant: "success" })
    },
    errorHandler: console.error
  })
  await tworker.load()
  await tworker.loadLanguage('eng')
  await tworker.initialize('eng')

  const imageURL = imageDataToURL(imageDataObj)
  const rec = await tworker.recognize(imageURL)
  await tworker.terminate()
  return rec.data.lines
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

type Color = [number, number, number] // RGB
