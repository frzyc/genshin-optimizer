import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Form, Modal, ProgressBar, Row } from 'react-bootstrap';
import { createWorker } from 'tesseract.js';
import scan_art_main from "../imgs/scan_art_main.png";
import Snippet from "../imgs/snippet.png";
import { ArtifactSetsData, ArtifactSlotsData, ArtifactStatsData } from './ArtifactData';

function UploadDisplay(props) {
  const [ocr, setOcr] = useState();
  const [fileName, setFileName] = useState("Click here to Upload Artifact Screenshot File");
  const [image, setImage] = useState('');
  const [progress, setProgress] = useState(0);
  const [progVariant, setProgVariant] = useState("")
  const [modalShow, setModalShow] = useState(false)

  const reset = () => {
    setOcr("")
    setFileName("Click here to Upload Artifact Screenshot File")
    setImage("")
    setProgress(0)
    setProgVariant("")
    setModalShow(false)
  }
  const parseValues = (parsed) => {
    let matches = []
    //parse substats
    Object.entries(ArtifactStatsData).forEach(([key, entry]) => {
      let regex = null
      if (entry.unit === "%") regex = new RegExp(entry.name + "\\s*\\+\\s*(\\d*\\.\\d)%", "im");
      else regex = new RegExp(entry.name + "\\s*\\+\\s*(\\d*)(?!.)", "im");//use negative lookahead to avoid the period
      let match = regex.exec(parsed)
      match && matches.push({ index: match.index, val: match[1], unit: entry.unit, key })
    })
    matches.sort((a, b) => a.index - b.index)
    matches.forEach((match, i) => {
      if (i >= 4) return;//this shouldn't happen, just in case
      let value = match.unit === "%" ? parseFloat(match.val) : parseInt(match.val)
      props.setSubStat && props.setSubStat(i, match.key, value)
    })
    //parse for sets
    for (const [key, setObj] of Object.entries(ArtifactSetsData))
      if (parsed.includes(setObj.name) && props.setSetKey) {
        props.setSetKey(key);
        break;
      }

    //parse for slot
    for (const [key, slotObj] of Object.entries(ArtifactSlotsData))
      if (parsed.includes(slotObj.name) && props.setSlotKey) {
        props.setSlotKey(key);
        break;
      }
  }
  const worker = createWorker({
    logger: m => {
      m.status === "loading tesseract core" && setProgVariant("danger");
      m.status.includes("loading language traineddata") && setProgVariant("warning");
      m.status.includes("initializing api") && setProgVariant("info");
      m.status === "recognizing text" && setProgVariant("success");
      setProgress(m.progress);
    },
  });
  const doOCR = async (image) => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(image);
    setOcr(text);
    parseValues(text);
  };

  let uploadedFile = (file) => {
    if (!file) return
    let reader = new FileReader();
    reader.onloadend = () =>
      setImage(reader.result)
    reader.readAsDataURL(file)
    doOCR(file)
    setFileName(file.name)
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
                Unfortunately, there isn't a reliable way to parse the <i>number of stars</i>, <i>the main stat</i>, and the <i>level</i> of the artifact right now. So you will have to manually put them in.
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
  let progPercent = (progress * 100).toFixed(2)
  return (<Row>
    {explainationModal}
    <Col>
      <Row className="mb-1">
        <Col>
          <Row className="mb-1">
            <Col>
              <h5>Parse Substats by Uploading Image</h5>
            </Col>
            <Col xs="auto"><Button variant="info" onClick={() => setModalShow(true)}>Show me How!</Button></Col>
          </Row>
          {progVariant ? <ProgressBar variant={progVariant} now={progPercent} label={`${progPercent}%`} /> : null}
        </Col>
      </Row>
      <Row className="mb-1">
        <Col xs={8} lg={4}>
          {img}
        </Col>
        {ocr && <Col xs={12} lg={8}>
          <p>Parsed Text:</p>
          <p>{ocr}</p>
        </Col>}
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