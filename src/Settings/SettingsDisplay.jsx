import { useCallback, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import ArtifactDatabase from "../Database/ArtifactDatabase"
import CharacterDatabase from "../Database/CharacterDatabase"
import { clearDatabase, createDatabaseObj, DatabaseInitAndVerify, loadDatabaseObj } from "../Database/DatabaseUtil"

DatabaseInitAndVerify()
export default function SettingsDisplay() {
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), []);
  ReactGA.pageview('/setting')
  return <Container>
    <Card bg="darkcontent" text="lightfont" className="mt-2">
      <Card.Header>Database management</Card.Header>
      <Card.Body>
        <DownloadCard forceUpdate={forceUpdate} />
        <UploadCard forceUpdate={forceUpdate} />
      </Card.Body>
    </Card>
  </Container>
}
function download(JSONstr, filename = "data.json") {
  const contentType = "application/json;charset=utf-8"
  if (window?.navigator?.msSaveOrOpenBlob) {
    const blob = new Blob([decodeURIComponent(encodeURI(JSONstr))], { type: contentType })
    navigator.msSaveOrOpenBlob(blob, filename)
  } else {
    const a = document.createElement('a');
    a.download = filename
    a.href = `data:${contentType},${encodeURIComponent(JSONstr)}`
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

function deleteDatabase() {
  if (!window.confirm("Are you sure you want to delete your database? All existing characters and artifacts will be deleted.")) return
  clearDatabase()
}
function copyToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(createDatabaseObj()))
  alert("Copied database to clipboard.")
}
function DownloadCard({ forceUpdate }) {
  const numChar = CharacterDatabase.getIdList().length
  const numArt = ArtifactDatabase.getIdList().length
  const downloadValid = Boolean(numChar || numArt)
  const deleteDB = () => {
    deleteDatabase();
    forceUpdate()
  }
  return <Card bg="lightcontent" text="lightfont" className="mb-3">
    <Card.Header>Database Download</Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col xs={12} md={6}><h6>Number of Characters: <b>{numChar}</b></h6></Col>
        <Col xs={12} md={6}><h6>Number of artifacts: <b>{numArt}</b></h6></Col>
      </Row>
      <small>Notes: any data within the "Tools" page, e.g. Resin amount/timer, are not part of the downloaded database.</small>
    </Card.Body>
    <Card.Footer>
      <Row>
        <Col xs="auto"><Button disabled={!downloadValid} onClick={() => download(JSON.stringify(createDatabaseObj()))}>Download</Button></Col>
        <Col ><Button disabled={!downloadValid} variant="info" onClick={copyToClipboard}>Copy to clipboard</Button></Col>
        <Col xs="auto"><Button disabled={!downloadValid} variant="danger" onClick={deleteDB} >Delete database</Button></Col>
      </Row>
    </Card.Footer>
  </Card>
}
async function readFile(file, cb) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    cb(reader.result)
  }
  reader.readAsText(file)
}
function replaceDatabase(obj, cb = () => { }) {
  if (!window.confirm("Are you sure you want to replace your database? All existing characters and artifacts will be deleted before replacement.")) return
  loadDatabaseObj(obj)
  cb()
}
function UploadCard({ forceUpdate }) {
  const [data, setdata] = useState("")
  const [filename, setfilename] = useState("")
  let error = ""
  let numChar, numArt, dataObj
  if (data) {
    try {
      dataObj = JSON.parse(data)
      const { characterDatabase, artifactDatabase } = dataObj
      numChar = Object.keys(characterDatabase).length
      numArt = Object.keys(artifactDatabase).length
    } catch (e) {
      error = `Invalid JSON: ${e}`
    }
  }
  const dataValid = Boolean(numChar || numArt)
  const replaceDB = () => {
    replaceDatabase(dataObj)
    setdata("")
    setfilename("")
    forceUpdate()
  }
  const onUpload = e => {
    const file = e.target.files[0]
    e.target.value = null//reset the value so the same file can be uploaded again...
    if (file) setfilename(file.name)
    readFile(file, setdata)
  }
  return <Card bg="lightcontent" text="lightfont">
    <Card.Header>Database Upload</Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Form.File
          className="mb-2"
          label={filename ? filename : "Upload your JSON file here"}
          onChange={onUpload}
          custom
          accept=".json"
        />
        <h6>...or Paste your data below...</h6>
        <textarea className="w-100 text-monospace" value={data} onChange={e => setdata(e.target.value)} style={{ minHeight: "10em" }} />
      </Row>
      {dataValid && <Row>
        <Col xs={12} md={6}><h6>Number of Characters: <b>{numChar}</b></h6></Col>
        <Col xs={12} md={6}><h6>Number of artifacts: <b>{numArt}</b></h6></Col>
      </Row>}
      {Boolean(data && (error || !dataValid)) && <Alert variant="danger">{error ? error : "Unable to parse character & artifact data from file."}</Alert>}
    </Card.Body>
    <Card.Footer>
      <Button variant={dataValid ? "success" : "danger"} disabled={!dataValid} onClick={replaceDB}>Replace database</Button>
    </Card.Footer>
  </Card>
}