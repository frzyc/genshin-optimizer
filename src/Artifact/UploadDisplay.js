import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import ReactGA from 'react-ga';
import { createWorker } from 'tesseract.js';
import scan_art_main from "../imgs/scan_art_main.png";
import Snippet from "../imgs/snippet.png";
import Stat from '../Stat';
import { clamp, hammingDistance } from '../Util/Util';
import Artifact from './Artifact';

const starColor = { r: 255, g: 204, b: 50 } //#FFCC32

export default function UploadDisplay(props) {
  let { setState, reset } = props
  const [fileName, setFileName] = useState("Click here to Upload Artifact Screenshot File");
  const [image, setImage] = useState('');

  const [scanning, setScanning] = useState(false)
  const [starText, setStarText] = useState("")
  const [otherProgress, setOtherProgress] = useState(0);
  const [otherProgVariant, setOtherProgVariant] = useState("")
  const [slotText, setSlotText] = useState("")
  const [substatProgress, setSubstatProgress] = useState(0);
  const [substatProgVariant, setSubstatProgVariant] = useState("")
  const [substatText, setSubstatText] = useState("")
  const [artSetProgress, setArtSetProgress] = useState(0);
  const [artSetProgVariant, setArtSetProgVariant] = useState("")
  const [artSetText, setArtSetText] = useState("")
  const [mainStatValText, setMainStatValText] = useState("")
  const [mainStatText, setMainStatText] = useState("")
  const [levelText, setLevelText] = useState("")

  const [modalShow, setModalShow] = useState(false)
  const resetText = () => {
    setStarText("")
    setArtSetText("")
    setSlotText("")
    setSubstatText("")
    setMainStatValText("")
    setMainStatText("")
    setLevelText("")
  }
  const resetState = () => {
    setFileName("Click here to Upload Artifact Screenshot File")
    setImage("")
    setModalShow(false)
    setScanning(false)

    setOtherProgress(0);
    setOtherProgVariant("")
    setSubstatProgress(0);
    setSubstatProgVariant("")
    setArtSetProgress(0);
    setArtSetProgVariant("")
    resetText();
  }

  const ocrImage = async (image, sProgress, sProgvariant, debug) => {
    if (process.env.NODE_ENV === "development" && debug) setImage(image)
    let tworker = createWorker({
      logger: m => {
        m.status === "loading tesseract core" && sProgvariant("danger");
        m.status.includes("loading language traineddata") && sProgvariant("warning");
        m.status.includes("initializing api") && sProgvariant("info");
        m.status === "recognizing text" && sProgvariant("success");
        sProgress(m.progress);
      },
      errorHandler: err => console.error(err)
    });
    await tworker.load();
    await tworker.loadLanguage('eng');
    await tworker.initialize('eng');
    let rec = await tworker.recognize(image);
    await tworker.terminate();
    if (process.env.NODE_ENV === "development" && debug) console.log(rec)
    return rec
  }

  const uploadedFile = async (file) => {

    if (!file) return
    setScanning(true)
    resetText()
    setFileName(file.name)
    const urlFile = await fileToURL(file)

    setImage(urlFile)
    const imageDataObj = await urlToImageData(urlFile)

    let numStars = clamp(starScanning(imageDataObj.data, imageDataObj.width, imageDataObj.height, 5), 3, 5)
    let numStarsText = <span>Detected <span className="text-success">{numStars}</span> Stars.</span>
    let awaits = [
      // other is for slotkey and mainStatValue and level
      ocrImage(imageDataToURL(processImageWithBandPassFilter(imageDataObj, { r: 140, g: 140, b: 140 }, { r: 255, g: 255, b: 255 }, { region: "top", mode: "bw" })), setOtherProgress, setOtherProgVariant),
      // substats
      ocrImage(imageDataToURL(processImageWithBandPassFilter(imageDataObj, { r: 30, g: 50, b: 80 }, { r: 160, g: 160, b: 160 }, { region: "bot" })), setSubstatProgress, setSubstatProgVariant),
      // artifact set, scan the greenish text
      ocrImage(imageDataToURL(processImageWithBandPassFilter(imageDataObj, { r: 30, g: 160, b: 30 }, { r: 200, g: 255, b: 200 }, { region: "bot", mode: "bw" })), setArtSetProgress, setArtSetProgVariant),
    ]

    let [whiteparsed, substatOCRText, setOCRText] = await Promise.all(awaits)

    let setKey = parseSetKey(setOCRText)
    let slotKey = parseSlotKey(whiteparsed)
    let substats = parseSubstat(substatOCRText)
    let level = NaN//looks like the level isnt consistently parsed. 
    let mainStatKey = parseMainStatKey(whiteparsed)
    let { mainStatValue, unit = "" } = parseMainStatvalue(whiteparsed)
    if (mainStatValue)
      setMainStatValText(<span>Detected Main Stat value to be <span className="text-success">{mainStatValue}{unit}</span>.</span>)
    else
      setMainStatValText(<span className="text-warning">Could not detect main stat value.</span>)
    //the main stat value is used to distinguish main stats between % and flat
    if (mainStatKey === "hp" || mainStatKey === "def" || mainStatKey === "atk")
      if (unit === "%" || Artifact.getSlotMainStatKeys(slotKey).includes(`${mainStatKey}_`))
        mainStatKey = `${mainStatKey}_`
    if (slotKey && !Artifact.getSlotMainStatKeys(slotKey).includes(mainStatKey))
      mainStatKey = ""

    if (mainStatKey) setMainStatText(<span>Detected main stat: <span className="text-success">{Stat.getStatNameRaw(mainStatKey)}</span></span>)

    if (setKey && numStars)
      if (!Artifact.getRarityArr(setKey).includes(numStars)) {
        numStars = 0;
        numStarsText = <span className="text-danger">Could not detect artifact rarity.</span>
      }

    //if main stat isnt parsed, then we try to guess it
    if (slotKey && !mainStatKey) {
      let stats = Artifact.getSlotMainStatKeys(slotKey)
      if (stats.length === 1) {
        mainStatKey = stats[0]
        setMainStatText(<span className="text-warning">Main stat was not successfully detected. Since artifact is of "{Artifact.getSlotName(slotKey)}", main stat: <span className="text-danger">{Stat.getStatName(mainStatKey)}</span>.</span>)
      } else {
        stats = stats.filter(stat => {
          if (mainStatValue && unit !== Stat.getStatUnit(stat)) return false
          if (substats && substats.some(substat => substat.key === stat)) return false
          if (mainStatValue && numStars && level && Artifact.getMainStatValue(stat, numStars, level) !== mainStatValue) return false
          return true
        });
        if (stats.length > 0) {
          mainStatKey = stats[0]
          setMainStatText(<span className="text-warning">Main stat was not successfully detected. Inferring main stat: <span className="text-danger">{Stat.getStatName(mainStatKey)}</span>.</span>)
        }
      }
    }

    let guessLevel = (nStars, mainSKey, mainSVal) => {
      //if level isn't parsed, then we try to guess it
      let mainStatValues = Artifact.getMainStatValues(nStars, mainSKey.includes("ele_dmg_bonus") ? "ele_dmg_bonus" : mainSKey)
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
    if (!isNaN(level)) setLevelText(<span>Detected level: <span className="text-success">{level}</span></span>)

    //try to guess the level when we only have mainStatKey and mainStatValue
    if (isNaN(level) && mainStatKey && mainStatValue) {
      let stars = setKey ? Artifact.getRarityArr(setKey) : Artifact.getStars().reverse()//reverse so we check 5* first
      for (const nStar of stars)
        if (guessLevel(nStar, mainStatKey, mainStatValue)) {
          if (!setKey || Artifact.getRarityArr(setKey).includes(nStar)) {
            numStars = nStar
            numStarsText = <span className="text-warning">Inferred <span className="text-success">{numStars}</span> Stars from Artifact Set.</span>
            break;
          }
        }
    }
    if (!isNaN(level) && !detectedlevel) setLevelText(<span className="text-warning">Inferred level: <span className="text-danger">{level}</span></span>)

    //check level validity against numStars
    if (numStars && !isNaN(level))
      if (level > numStars * 4)
        level = NaN

    //check if the final star values are valid
    numStars = clamp(numStars, 3, 5)

    //if the level is not parsed at all after all the prevous steps, default it to the highest level of the star value
    if (isNaN(level)) {
      level = numStars * 4
      setLevelText(<span className="text-warning">Could not detect artifact level. Default to: <span className="text-danger">{level}</span></span>)
    }

    //try to infer slotKey if could not be detected.
    if (slotKey) {
      setSlotText(<span>Detected slot name <span className="text-success">{Artifact.getSlotName(slotKey)}</span></span>)
    } else if (mainStatKey) {
      //infer slot name from main stat
      let pieces = setKey ? Artifact.getPieces(setKey) : Artifact.getSlotKeys()
      for (const testSlotKey of pieces) {
        if (Artifact.getMainStatKeys(testSlotKey).includes(mainStatKey)) {
          slotKey = testSlotKey;
          setSlotText(<span className="text-warning">Slot name was not successfully detected. Inferring slot name: <span className="text-danger">{Artifact.getSlotName(slotKey)}</span>.</span>)
          break;
        }
      }
    }

    let state = {}
    if (!isNaN(level)) state.level = level

    if (setKey) {
      state.setKey = setKey
      setArtSetText(<span>Detected set <span className="text-success">{Artifact.getSetName(setKey)}</span></span>)
    } else
      setArtSetText(<span className="text-danger">Could not detect artifact set name.</span>)

    if (slotKey) {
      state.slotKey = slotKey
    } else {
      setSlotText(<span className="text-danger">Could not detect slot name.</span>)
    }

    if (substats) {
      state.substats = substats
      let len = substats.reduce((accu, substat) => accu + (substat.key ? 1 : 0), 0)
      let low = Artifact.getBaseSubRollNumLow(numStars)
      if (numStars && len < low)
        setSubstatText(<span className="text-warning">Detected {len} substats, but there should be at least {low} substats.</span>)
      else
        setSubstatText(<span>Detected <span className="text-success">{len}</span> substats.</span>)
    } else
      setSubstatText(<span className="text-danger">Could not detect any substats.</span>)

    if (numStars) {
      state.numStars = numStars
      setStarText(numStarsText)
    }
    if (mainStatKey) {
      state.mainStatKey = mainStatKey
    } else
      setMainStatText(<span className="text-danger">Could not detect main stat.</span>)
    setState?.(state)
  }

  useEffect(() => {
    let pasteFunc = e =>
      uploadedFile(e.clipboardData.files[0])
    window.addEventListener('paste', pasteFunc);
    reset?.(resetState);
    return () =>
      window.removeEventListener('paste', pasteFunc)
  })
  let img = Boolean(image) && <img src={image} className="w-100 h-auto" alt="Screenshot to parse for artifact values" />
  let artSetProgPercent = (artSetProgress * 100).toFixed(1)
  let substatProgPercent = (substatProgress * 100).toFixed(1)
  let otherProgPercent = (otherProgress * 100).toFixed(1)
  return (<Row>
    <ExplainationModal {...{ modalShow, setModalShow }} />
    <Col xs={12} className="mb-2">
      <Row>
        <Col>
          <h6 className="mb-0">Parse Substats by Uploading Image</h6>
        </Col>
        <Col xs="auto"><Button variant="info" size="sm" onClick={() => {
          setModalShow(true)
          ReactGA.modalview('/artifact/how-to-upload')
        }}>Show me How!</Button></Col>
      </Row>
    </Col>
    <Col xs={8} lg={image ? 4 : 0}>{img}</Col>
    <Col xs={12} lg={image ? 8 : 12}>
      {scanning && <>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${artSetProgPercent < 100 ? "ning" : "ned"} Artifact Set`}</h6>
          <ProgressBar variant={artSetProgVariant} now={artSetProgPercent} label={`${artSetProgPercent}%`} />
        </div>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${substatProgPercent < 100 ? "ning" : "ned"} Artifact Substat`}</h6>
          <ProgressBar variant={substatProgVariant} now={substatProgPercent} label={`${substatProgPercent}%`} />
        </div>
        <div className="mb-2">
          <h6 className="mb-0">{`Scan${otherProgPercent < 100 ? "ning" : "ned"} Other`}</h6>
          <ProgressBar variant={otherProgVariant} now={otherProgPercent} label={`${otherProgPercent}%`} />
        </div>
        <div className="mb-2">
          <div>{starText}</div>
          <div>{artSetText}</div>
          <div>{slotText}</div>
          <div>{mainStatValText}</div>
          <div>{mainStatText}</div>
          <div>{levelText}</div>
          <div>{substatText}</div>
        </div>
      </>}
      <Form.File
        type="file"
        className="mb-0"
        id="inputGroupFile01"
        label={fileName}
        onChange={(e) => {
          let file = e.target.files[0]
          uploadedFile(file)
        }}
        custom={true}
      />
      {Boolean(!image) && <Form.Label className="mb-0">Please Select an Image, or paste a screenshot here (Ctrl+V)</Form.Label>}
    </Col>
  </Row >)
}
function ExplainationModal({ modalShow, setModalShow }) {
  return <Modal show={modalShow} onHide={() => setModalShow(false)} size="xl" variant="success" contentClassName="bg-transparent">
    <Card bg="darkcontent" text="lightfont" >
      <Card.Header>
        <Card.Title>
          <Row>
            <Col><span>How do Upload Screenshots for parsing</span></Col>
            <Col xs="auto">
              <Button variant="danger" onClick={() => setModalShow(false)} >
                <FontAwesomeIcon icon={faTimes} /></Button>
            </Col>
          </Row>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col xs={8} md={4}>
            <img alt="snippet of the screen to take" src={Snippet} className="w-100 h-auto" />
          </Col>
          <Col xs={12} md={8}>

            <p>Using screenshots can dramatically decrease the amount of time you manually input in stats on the Genshin Optimizer.</p>
            <h5>What to include in the screenshot.</h5>
            <p>
              In Genshin Impact, Open your bag, and navigate to the artifacts tab. Select the artifact you want to scan with Genshin Optimizer.
          To Take a screenshot, in Windows, the shortcut is <strong>Shift + WindowsKey + S</strong>.
          Once you selected the region, the image is automatically included in your clipboard.
        </p></Col>
        </Row>

        <Row>
          <Col>
            <h5>Adding Screenshot to Genshin Optimizer</h5>
            <p>
              At this point, you should have the artifact snippet either saved to your harddrive, or in your clipboard.
          You can click on the box next to "Browse" to browse the file in your harddrive, or even easier, just press <strong>Ctrl + V</strong> to paste from your clipboard.
          You should be able to see a Preview of your artifact snippet, and after waiting a few seconds, the artifact set and the substats will be filled in in the <b>Artifact Editor</b>.
        </p>
          </Col>
          <Col xs={12}>
            <h5>Finishing the Artifact</h5>
            <p>
              Unfortunately, computer vision is not 100%. There will always be cases where something is not scanned properly. You should always double check the scanned artifact values!
          Once the artifact has been filled, Click on <strong>Add Artifact</strong> to finish editing the artifact.
        </p>
            <img alt="main screen after importing stats" src={scan_art_main} className="w-75 h-auto" />
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer>
        <Button variant="danger" onClick={() => setModalShow(false)}>
          <span>Close</span>
        </Button>
      </Card.Footer>
    </Card>
  </Modal>
}



let reader = new FileReader()
function fileToURL(file) {
  return new Promise(resolve => {
    // let reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    }
    reader.readAsDataURL(file)
  })
}
function urlToImageData(urlFile) {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = () =>
      resolve(getImageData(img))
    img.src = urlFile
  })
}

function getImageData(image) {
  const tempCanvas = document.createElement('canvas'),
    tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  tempCtx.drawImage(image, 0, 0, image.width, image.height);
  const imageDataObj = tempCtx.getImageData(0, 0, image.width, image.height);
  return imageDataObj;
}

function imageDataToURL(imageDataObj) {
  // create off-screen canvas element
  let canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

  canvas.width = imageDataObj.width;
  canvas.height = imageDataObj.height;

  // create imageData object
  let idata = ctx.createImageData(imageDataObj.width, imageDataObj.height);

  // set our buffer as source
  idata.data.set(imageDataObj.data);

  // update canvas with new data
  ctx.putImageData(idata, 0, 0);

  let dataUri = canvas.toDataURL(); // produces a PNG file

  return dataUri
}

function starScanning(pixels, width, height, defVal = 0) {
  let d = pixels;
  let lastRowNum = 0;
  let rowsWithNumber = 0;
  for (let y = 0; y < height; y++) {
    let star = 0;
    let onStar = false;
    for (let x = 0; x < width; x++) {
      let i = (y * width + x) * 4
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];
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
// function processImageWithFilter(pixelData, color, region, threshold = 5) {
//   let d = Uint8ClampedArray.from(pixelData.data)
//   let halfInd = Math.floor(pixelData.width * (pixelData.height / 2) * 4)
//   for (let i = 0; i < d.length; i += 4) {
//     let outputWhite = true;
//     let r = d[i];
//     let g = d[i + 1];
//     let b = d[i + 2];
//     let pixelColor = { r, g, b }
//     if (((region === "top" && i < halfInd) || (region === "bot" && i > halfInd) || !region) && colorCloseEnough(pixelColor, color, threshold))
//       outputWhite = false
//     d[i] = d[i + 1] = d[i + 2] = outputWhite ? 255 : 0
//   }
//   return new ImageData(d, pixelData.width, pixelData.height)
// }
function processImageWithBandPassFilter(pixelData, color1, color2, options) {
  //region - "top","bot","all" default all
  //mode - "bw","color","invert" default color
  let { region, mode } = options
  if (!region) region = "all"
  let d = Uint8ClampedArray.from(pixelData.data)
  let halfInd = Math.floor(pixelData.width * (pixelData.height / 2) * 4)
  let top = region === "top"
  let bot = region === "bot"
  let all = region === "all"
  let bw = mode === "bw"
  let invert = mode === "invert"
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if ((all || (top && i < halfInd) || (bot && i > halfInd)) &&
      r >= color1.r && r <= color2.r &&
      g >= color1.g && g <= color2.g &&
      b >= color1.b && b <= color2.b) {
      if (bw) d[i] = d[i + 1] = d[i + 2] = 0
      else if (invert) {
        d[i] = 255 - r
        d[i + 1] = 255 - g
        d[i + 2] = 255 - b
      }
      //else orignal color
    } else {
      d[i] = d[i + 1] = d[i + 2] = 255
    }
  }
  return new ImageData(d, pixelData.width, pixelData.height)
}

function colorCloseEnough(color1, color2, threshold = 5) {
  const intCloseEnough = (a, b) => (Math.abs(a - b) <= threshold)
  if (intCloseEnough(color1.r, color2.r) &&
    intCloseEnough(color1.g, color2.g) &&
    intCloseEnough(color1.b, color2.b)) {
    return true
  }
  return false
}

function parseSubstat(recognition, defVal = null) {
  let texts = recognition?.data?.lines?.map(line => line.text)
  if (!texts) return defVal
  let matches = []
  for (const text of texts) {
    //parse substats
    Artifact.getSubStatKeys().forEach(key => {
      let regex = null
      let unit = Stat.getStatUnit(key)
      let name = Stat.getStatNameRaw(key)
      if (unit === "%") regex = new RegExp(name + "\\s*\\+\\s*(\\d+\\.\\d)%", "im");
      else regex = new RegExp(name + "\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)", "im");
      let match = regex.exec(text)
      match && matches.push({ value: match[1], unit, key })
    })
  }
  matches.forEach((match, i) => {
    if (i >= 4) return;//this shouldn't happen, just in case
    match.value = match.unit === "%" ? parseFloat(match.value) : parseInt(match.value)
  })
  let substats = []
  for (let i = 0; i < 4; i++) {
    if (matches[i]) substats.push({ key: matches[i].key, value: matches[i].value })
    else substats.push({ key: "", value: 0 })
  }
  return substats
}
function parseMainStatKey(recognition, defVal = "") {
  let texts = recognition?.data?.lines?.map(line => line.text)
  if (!texts) return defVal
  for (const text of texts)
    for (const key of Artifact.getMainStatKeys()) {
      if (text.toLowerCase().includes(Stat.getStatNameRaw(key).toLowerCase()))
        return key
      //use fuzzy compare on the ... Bonus texts. heal_bonu is included.
      if (key.includes("_bonu") && hammingDistance(text.replace(/\W/g, ''), Stat.getStatNameRaw(key).replace(/\W/g, '')) <= 1)
        return key
    }
  return defVal
}
function parseSetKey(recognition, defVal = "") {
  let texts = recognition?.data?.lines?.map(line => line.text)
  if (!texts) return defVal
  //parse for sets
  for (const text of texts)
    for (const key of Artifact.getSetKeys())
      if (hammingDistance(text.replace(/\W/g, ''), Artifact.getSetName(key).replace(/\W/g, '')) <= 2)
        return key
}
function parseSlotKey(recognition, defVal = "") {
  let texts = recognition?.data?.lines?.map(line => line.text)
  if (!texts) return defVal
  //parse for slot
  for (const text of texts)
    for (const key of Artifact.getSlotKeys())
      if (hammingDistance(text.replace(/\W/g, ''), Artifact.getSlotName(key).replace(/\W/g, '')) <= 2)
        return key;
}
// function parseLevel(text) {
//   let regex = /\+(\d{1,2})/
//   let match = regex.exec(text)
//   if (match) return parseInt(match[1])
//   return NaN
// }
function parseMainStatvalue(recognition, defVal = { mainStatValue: NaN }) {
  let texts = recognition?.data?.lines?.map(line => line.text)
  if (!texts) return defVal
  for (const text of texts) {
    let regex = /(\d+\.\d)%/
    let match = regex.exec(text)
    if (match) return { mainStatValue: parseFloat(match[1]), unit: "%" }
    regex = /(\d+,\d{3}|\d{2,3})/
    match = regex.exec(text)
    if (match) return { mainStatValue: parseInt(match[1].replace(/,/g, "")) }
  }
  return defVal
}