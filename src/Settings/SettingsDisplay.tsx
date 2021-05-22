import { useState } from "react"
import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from "react-i18next"
import ArtifactDatabase from "../Database/ArtifactDatabase"
import CharacterDatabase from "../Database/CharacterDatabase"
import { clearDatabase, createDatabaseObj, DatabaseInitAndVerify, loadDatabaseObj } from "../Database/DatabaseUtil"
import { languageCodeList } from "../i18n"
import { useForceUpdate } from "../Util/ReactUtil"

DatabaseInitAndVerify()
export default function SettingsDisplay() {
  const { t } = useTranslation(["settings"]);
  const [, forceUpdate] = useForceUpdate()
  ReactGA.pageview('/setting')

  return <Container>
    <Card bg="darkcontent" text={"lightfont" as any} className="mt-2">
      <Card.Header><Trans t={t} i18nKey="title" /></Card.Header>
      <Card.Body>
        <LanguageCard />
        <DownloadCard forceUpdate={forceUpdate} />
        <UploadCard forceUpdate={forceUpdate} />
      </Card.Body>
    </Card>
  </Container >
}

function LanguageCard() {
  const { t } = useTranslation();
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-3">
    <Card.Header>{t("settings:languageCard.selectLanguage")} <Badge variant="warning">{t("ui:underConstruction")}</Badge></Card.Header>
    <Card.Body>
      <LanguageDropdown />
    </Card.Body>
  </Card>
}

const nativeLanguages = {
  "chs": "中文 正体字",
  "cht": "中文 繁體字",
  "de": "Deutsch",
  "en": "English",
  "es": "español",
  "fr": "français",
  "id": "Bahasa Indonesia",
  "ja": "日本語",
  "ko": "한국어",
  "pt": "Português",
  "ru": "Русский язык",
  "th": "ภาษาไทย",
  "vi": "Tiếng Việt"
}
export function LanguageDropdown() {
  const { t, i18n } = useTranslation(["ui", "settings"]);
  const onSetLanguage = (lang) => () => i18n.changeLanguage(lang);
  const currentLang = i18n.languages[0];
  return <Dropdown className="flex-grow-1 mb-2">
    <Dropdown.Toggle className="w-100" variant="primary">
      {t('settings:languageCard.languageFormat', { language: t(`languages:${currentLang}`) })}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {languageCodeList.map((lang) => <Dropdown.Item key={lang} onClick={onSetLanguage(lang)}><Trans i18nKey={`languages:${lang}`} />{lang !== currentLang ? ` (${nativeLanguages[lang]})` : ""}</Dropdown.Item>)}
    </Dropdown.Menu>
  </Dropdown>
}

function download(JSONstr, filename = "data.json") {
  const contentType = "application/json;charset=utf-8"
  if (window?.navigator?.msSaveOrOpenBlob as any) { // TODO: Function is always defined, do we want to call it instead?
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

function deleteDatabase(t) {
  if (!window.confirm(t("settings:dialog.delete-database"))) return
  clearDatabase()
}
function copyToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(createDatabaseObj()))
  alert("Copied database to clipboard.")
}
function DownloadCard({ forceUpdate }) {
  const { t } = useTranslation(["settings"]);
  const numChar = CharacterDatabase.getIdList().length
  const numArt = ArtifactDatabase.getIdList().length
  const downloadValid = Boolean(numChar || numArt)
  const deleteDB = () => {
    deleteDatabase(t);
    forceUpdate()
  }
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-3">
    <Card.Header><Trans t={t} i18nKey="downloadCard.databaseDownload" /></Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col xs={12} md={6}><h6><Trans t={t} i18nKey="downloadCard.charsStored" count={numChar}><b>{{ count: numChar }}</b> Characters Stored</Trans></h6></Col>
        <Col xs={12} md={6}><h6><Trans t={t} i18nKey="downloadCard.artisStored" count={numArt}><b>{{ count: numArt }}</b> Artifacts Stored</Trans></h6></Col>
      </Row>
      <small><Trans t={t} i18nKey="downloadCard.databaseDisclaimer" /></small>
    </Card.Body>
    <Card.Footer>
      <Row>
        <Col xs="auto"><Button disabled={!downloadValid} onClick={() => download(JSON.stringify(createDatabaseObj()))}><Trans t={t} i18nKey="downloadCard.button.download" /></Button></Col>
        <Col ><Button disabled={!downloadValid} variant="info" onClick={copyToClipboard}><Trans t={t} i18nKey="downloadCard.button.copy" /></Button></Col>
        <Col xs="auto"><Button disabled={!downloadValid} variant="danger" onClick={deleteDB} ><Trans t={t} i18nKey="downloadCard.button.delete" /></Button></Col>
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
  const { t } = useTranslation(["ui", "settings"]);
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
  return <Card bg="lightcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="settings:uploadCard.title" /></Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Form.File
          className="mb-2"
          label={filename ? filename : <Trans t={t} i18nKey="settings:uploadCard.hint" />}
          onChange={onUpload}
          custom
          accept=".json"
        />
        <h6><Trans t={t} i18nKey="settings:uploadCard.hintPaste" /></h6>
        <textarea className="w-100 text-monospace" value={data} onChange={e => setdata(e.target.value)} style={{ minHeight: "10em" }} />
      </Row>
      {dataValid && <Row>
        <Col xs={12} md={6}><h6><Trans t={t} i18nKey="settings:uploadCard.numChar" /> <b>{numChar}</b></h6></Col>
        <Col xs={12} md={6}><h6><Trans t={t} i18nKey="settings:uploadCard.numArt" /> <b>{numArt}</b></h6></Col>
      </Row>}
      {Boolean(data && (error || !dataValid)) && <Alert variant="danger">{error ? error : "Unable to parse character & artifact data from file."}</Alert>}
    </Card.Body>
    <Card.Footer>
      <Button variant={dataValid ? "success" : "danger"} disabled={!dataValid} onClick={replaceDB}><Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
    </Card.Footer>
  </Card>
}