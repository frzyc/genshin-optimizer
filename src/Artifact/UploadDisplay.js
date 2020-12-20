import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import { createWorker } from 'tesseract.js';
import { ArtifactSetsData, ArtifactSlotsData } from '../Data/ArtifactData';
import scan_art_main from "../imgs/scan_art_main.png";
import Snippet from "../imgs/snippet.png";
import Stat from '../Stat';
import Artifact from './Artifact';
import ReactGA from 'react-ga';

const whiteColor = { r: 250, g: 250, b: 250 } //#FFFFFF
const subStatColor = { r: 80, g: 90, b: 105 } //#495366
const setNameColor = { r: 92, g: 178, b: 86 } //#5CB256
const starColor = { r: 255, g: 204, b: 50 } //#FFCC32

function UploadDisplay(props) {
  const [fileName, setFileName] = useState("Click here to Upload Artifact Screenshot File");
  const [image, setImage] = useState('');

  const [scanning, setScanning] = useState(false)
  const [otherProgress, setOtherProgress] = useState(0);
  const [otherProgVariant, setOtherProgVariant] = useState("")
  const [substatProgress, setSubstatProgress] = useState(0);
  const [substatProgVariant, setSubstatProgVariant] = useState("")
  const [artSetProgress, setArtSetProgress] = useState(0);
  const [artSetProgVariant, setArtSetProgVariant] = useState("")
  const [mainStatProgress, setMainStatProgress] = useState(0);
  const [mainStatProgVariant, setMainStatProgVariant] = useState("")

  const [modalShow, setModalShow] = useState(false)

  const reset = () => {
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
    setMainStatProgress(0);
    setMainStatProgVariant("")
  }

  const ocrImage = async (image, sProgress, sProgvariant) => {
    let tworker = createWorker({
      logger: m => {
        m.status === "loading tesseract core" && sProgvariant("danger");
        m.status.includes("loading language traineddata") && sProgvariant("warning");
        m.status.includes("initializing api") && sProgvariant("info");
        m.status === "recognizing text" && sProgvariant("success");
        sProgress(m.progress);
      },
    });
    await tworker.load();
    await tworker.loadLanguage('eng');
    await tworker.initialize('eng');
    const { data: { text } } = await tworker.recognize(image);
    return text
  }

  const uploadedFile = async (file) => {

    if (!file) return
    setScanning(true)
    setFileName(file.name)
    const urlFile = await fileToURL(file)

    setImage(urlFile)
    const imageDataObj = await urlToImageData(urlFile)

    let numStars = starScanning(imageDataObj.data, imageDataObj.width, imageDataObj.height)
    let awaits = [
      // other
      ocrImage(imageDataToURL(processImageWithFilter(imageDataObj, whiteColor)), setOtherProgress, setOtherProgVariant),
      // substat
      ocrImage(imageDataToURL(processImageWithFilter(imageDataObj, subStatColor, 15)), setSubstatProgress, setSubstatProgVariant),
      // artifact set
      ocrImage(imageDataToURL(processImageWithFilter(imageDataObj, setNameColor)), setArtSetProgress, setArtSetProgVariant),
      // main stat
      ocrImage(imageDataToURL(processImageWithBandPassFilter(imageDataObj, { r: 150, g: 150, b: 160 }, { r: 215, g: 200, b: 220 })), setMainStatProgress, setMainStatProgVariant)
    ]

    let [whiteparsed, substatOCRText, setOCRText, mainStatOCRText] = await Promise.all(awaits)

    let setKey = parseSetKey(setOCRText)
    let slotKey = parseSlotKey(whiteparsed)
    let substats = parseSubstat(substatOCRText)
    let level = parseLevel(whiteparsed)
    let mainStatKey = parseMainStatKey(mainStatOCRText)
    let { mainStatValue, unit = "" } = parseMainStatvalue(whiteparsed)

    //so far the main stat value is used to distinguish main stats between % and flat
    if (unit === "%" && (mainStatKey === "hp" || mainStatKey === "def" || mainStatKey === "atk"))
      mainStatKey += "_"

    if (setKey && numStars)
      if (!Artifact.getRarityArr(setKey).includes(numStars))
        numStars = 0;

    if (numStars && !isNaN(level)) {
      if (level > numStars * 4)
        level = NaN
    }

    //if main stat isnt parsed, then we try to guess it
    if (slotKey && !mainStatKey) {
      let stats = ArtifactSlotsData[slotKey].stats
      if (stats.length === 1) mainStatKey = stats[0]
      else {
        stats = stats.filter(stat => {
          if (mainStatValue && unit !== Stat.getStatUnit(stat)) return false
          if (substats && substats.some(substat => substat.key === stat)) return false
          if (mainStatValue && numStars && level && Artifact.getMainStatValue(stat, numStars, level) !== mainStatValue) return false
          return true
        });
        if (stats.length > 0) mainStatKey = stats[0]
      }
    }

    let state = {}
    if (!isNaN(level)) state.level = level
    if (setKey) state.setKey = setKey
    if (slotKey) state.slotKey = slotKey
    if (substats) state.substats = substats
    if (numStars) state.numStars = numStars
    if (mainStatKey) state.mainStatKey = mainStatKey
    props.setState?.(state)
  }

  let explainationModal =
    (<Modal show={modalShow} onHide={() => setModalShow(false)} size="xl" variant="success" dialogAs={Container} className="pt-3 pb-3">
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
    </Modal>)
  useEffect(() => {
    let pasteFunc = e =>
      uploadedFile(e.clipboardData.files[0])
    window.addEventListener('paste', pasteFunc);
    props.reset(reset);
    return () =>
      window.removeEventListener('paste', pasteFunc)
  })
  let img = image ? <img src={image} className="w-100 h-auto" alt="Screenshot to parse for artifact values" /> : <span>Please Select an Image</span>
  let artSetProgPercent = (artSetProgress * 100).toFixed(1)
  let mainstatProgPercent = (mainStatProgress * 100).toFixed(1)
  let substatProgPercent = (substatProgress * 100).toFixed(1)
  let otherProgPercent = (otherProgress * 100).toFixed(1)
  return (<Row>
    {explainationModal}
    <Col>
      <Row className="mb-1">
        <Col>
          <Row className="mb-1">
            <Col>
              <h5>Parse Substats by Uploading Image</h5>
            </Col>
            <Col xs="auto"><Button variant="info" onClick={() => {
              setModalShow(true)
              ReactGA.modalview('/artifact/how-to-upload')
            }}>Show me How!</Button></Col>
          </Row>
        </Col>
      </Row>
      <Row className="mb-1">
        <Col xs={8} lg={4}>
          {img}
        </Col>
        {scanning ? <Col xs={12} lg={8}>
          <h6>{`Scan${artSetProgPercent < 100 ? "ning" : "ned"} Artifact Set`}</h6>
          <ProgressBar variant={artSetProgVariant} now={artSetProgPercent} label={`${artSetProgPercent}%`} className="mb-3" />
          <h6>{`Scan${mainstatProgPercent < 100 ? "ning" : "ned"} Artifact Main Stat`}</h6>
          <ProgressBar variant={mainStatProgVariant} now={mainstatProgPercent} label={`${mainstatProgPercent}%`} className="mb-3" />
          <h6>{`Scan${substatProgPercent < 100 ? "ning" : "ned"} Artifact Substat`}</h6>
          <ProgressBar variant={substatProgVariant} now={substatProgPercent} label={`${substatProgPercent}%`} className="mb-3" />
          <h6>{`Scan${otherProgPercent < 100 ? "ning" : "ned"} Other`}</h6>
          <ProgressBar variant={otherProgVariant} now={otherProgPercent} label={`${otherProgPercent}%`} className="mb-3" />
        </Col> : null}
      </Row>
      <Row className="mb-4">
        <Col>
          <Form.Group as={Col}>
            <Form.File
              type="file"
              className="custom-file-label"
              id="inputGroupFile01"
              label={fileName}
              onChange={(e) => {
                let file = e.target.files[0]
                uploadedFile(file)
              }}
              custom
            />
          </Form.Group>
        </Col>
      </Row>
    </Col>
  </Row>)
}
export default UploadDisplay;

function fileToURL(file) {
  return new Promise(resolve => {
    let reader = new FileReader();
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

function starScanning(pixels, width, height) {
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
      if (rowsWithNumber >= 20) return lastRowNum
    }
  }
  return 0;
}
function processImageWithFilter(pixelData, color, threshold = 5) {
  let d = Uint8ClampedArray.from(pixelData.data)
  for (let i = 0; i < d.length; i += 4) {
    let outputWhite = true;
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    let pixelColor = { r, g, b }
    if (colorCloseEnough(pixelColor, color, threshold))
      outputWhite = false
    d[i] = d[i + 1] = d[i + 2] = outputWhite ? 255 : 0
  }
  return new ImageData(d, pixelData.width, pixelData.height)
}

function processImageWithBandPassFilter(pixelData, color1, color2) {
  let d = Uint8ClampedArray.from(pixelData.data)
  //this also cuts away the bottom half of the picture...
  let halfInd = Math.floor(pixelData.width * (pixelData.height / 2) * 4)
  for (let i = 0; i < d.length; i += 4) {
    let outputWhite = true;
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (i < halfInd && r > color1.r && r < color2.r &&
      g > color1.g && g < color2.g &&
      b > color1.b && b < color2.b)
      outputWhite = false
    d[i] = d[i + 1] = d[i + 2] = outputWhite ? 255 : 0
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

function parseSubstat(text) {
  let matches = []
  //parse substats
  Artifact.getSubStatKeys().forEach(key => {
    let regex = null
    let unit = Stat.getStatUnit(key)
    let name = Stat.getStatName(key)
    if (unit === "%") regex = new RegExp(name + "\\s*\\+\\s*(\\d+\\.\\d)%", "im");
    else regex = new RegExp(name + "\\s*\\+\\s*(\\d+,\\d+|\\d+)($|\\s)", "im");
    let match = regex.exec(text)
    match && matches.push({ index: match.index, value: match[1], unit, key })
  })
  matches.sort((a, b) => a.index - b.index)
  matches.forEach((match, i) => {
    if (i >= 4) return;//this shouldn't happen, just in case
    match.value = match.unit === "%" ? parseFloat(match.value) : parseInt(match.value)
    // props.setSubStat && props.setSubStat(i, match.key, value)
  })
  let substats = []
  for (let i = 0; i < 4; i++) {
    if (matches[i]) substats.push({ key: matches[i].key, value: matches[i].value })
    else substats.push({ key: "", value: 0 })
  }
  return substats
}
function parseMainStatKey(text) {
  for (const key of Artifact.getMainStatKeys())
    if (text.toLowerCase().includes(Stat.getStatName(key).toLowerCase()))
      return key
}
function parseSetKey(text) {
  //parse for sets
  for (const [key, setObj] of Object.entries(ArtifactSetsData))
    if (text.toLowerCase().includes(setObj.name.toLowerCase()))
      return key//props.setSetKey(key);
}
function parseSlotKey(text) {
  //parse for slot
  for (const [key, slotObj] of Object.entries(ArtifactSlotsData))
    if (text.toLowerCase().includes(slotObj.name.toLowerCase()))
      return key;//props.setSlotKey(key);
}
function parseLevel(text) {
  let regex = /\+(\d{1,2})/
  let match = regex.exec(text)
  if (match) return parseInt(match[1])
  return NaN
}
function parseMainStatvalue(text) {
  let preText = text.split('+')[0]
  let regex = /(\d+\.\d+)%/
  let match = regex.exec(preText)
  if (match) return { mainStatValue: parseFloat(match[1]), unit: "%" }
  regex = /(\d+,\d+|\d{2,3})/
  match = regex.exec(preText)
  if (match) return { mainStatValue: parseInt(match[1]) }
  return { mainStatValue: NaN }
}