import { faClipboard, faFileDownload, faFileUpload, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from "react-i18next"
import { ArtCharDatabase, DatabaseContext } from "../Database/Database"
import { dbStorage } from '../Database/DBStorage'
import { importGO, ImportResult as GOImportResult } from '../Database/exim/go'
import { ImportResultCounter, exportGOOD, importGOOD, ImportResult as GOODImportResult } from '../Database/exim/good'
import { importMona } from '../Database/exim/mona'
import { languageCodeList } from "../i18n"
import useForceUpdate from '../ReactHooks/useForceUpdate'

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

function download(JSONstr: string, filename = "data.json") {
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

function deleteDatabase(t, database: ArtCharDatabase) {
  if (!window.confirm(t("uploadCard.goUpload.deleteDatabasePrompt"))) return
  dbStorage.clear()
  database.reloadStorage()
}
function copyToClipboard() {
  navigator.clipboard.writeText(JSON.stringify(exportGOOD(dbStorage)))
    .then(() => alert("Copied database to clipboard."))
    .catch(console.error)
}
function DownloadCard({ forceUpdate }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation(["settings"]);
  const numChar = database._getCharKeys().length
  const numArt = database._getArts().length
  const numWeapon = database._getWeapons().length
  const downloadValid = Boolean(numChar || numArt)
  const deleteDB = () => {
    deleteDatabase(t, database);
    forceUpdate()
  }
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-3">
    <Card.Header><Trans t={t} i18nKey="downloadCard.databaseDownload" /></Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col xs={6} md={4}><Trans t={t} i18nKey="count.chars" /> {numChar}</Col>
        <Col xs={6} md={4}><Trans t={t} i18nKey="count.arts" /> {numArt}</Col>
        <Col xs={6} md={4}><Trans t={t} i18nKey="count.weapons" /> {numWeapon}</Col>
      </Row>
      <small><Trans t={t} i18nKey="downloadCard.databaseDisclaimer" /></small>
    </Card.Body>
    <Card.Footer><Row>
      <Col xs="auto"><Button disabled={!downloadValid} onClick={() => download(JSON.stringify(exportGOOD(dbStorage)))}><FontAwesomeIcon icon={faFileDownload} /> <Trans t={t} i18nKey="downloadCard.button.download" /></Button></Col>
      <Col ><Button disabled={!downloadValid} variant="info" onClick={copyToClipboard}><FontAwesomeIcon icon={faClipboard} /> <Trans t={t} i18nKey="downloadCard.button.copy" /></Button></Col>
      <Col xs="auto"><Button disabled={!downloadValid} variant="danger" onClick={deleteDB} ><FontAwesomeIcon icon={faTrashAlt} /> <Trans t={t} i18nKey="downloadCard.button.delete" /></Button></Col>
    </Row></Card.Footer>
  </Card>
}

function UploadCard({ forceUpdate }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation("settings");
  const [data, setdata] = useState("")
  const [filename, setfilename] = useState("")
  const [errorMsg, setErrorMsg] = useState("") // TODO localize error msg
  const dataObj: UploadData | undefined = useMemo(() => {
    if (!data) return
    let parsed: any
    try {
      parsed = JSON.parse(data)
      if (typeof parsed !== "object") {
        setErrorMsg("uploadCard.error.jsonParse")
        return
      }
    } catch (e) {
      setErrorMsg("uploadCard.error.jsonParse")
      return
    }
    // Figure out the file format
    if (parsed.version === "1" && ["flower", "feather", "sand", "cup", "head"].some(k => Object.keys(parsed).includes(k))) {
      // Parse as mona format
      const imported = importMona(parsed, database)
      if (!imported) {
        setErrorMsg("uploadCard.error.monaInvalid")
        return
      }
      return imported
    } else if ("version" in parsed && "characterDatabase" in parsed && "artifactDatabase" in parsed) {
      // Parse as GO format
      const imported = importGO(parsed)
      if (!imported) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }
      return imported
    } else if (parsed.format === "GOOD") {
      // Parse as GOOD format
      const imported = importGOOD(parsed, database)
      if (!imported) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }
      return imported
    }
    setErrorMsg("uploadCard.error.unknown")
    return
  }, [data, database])

  const reset = () => {
    setdata("")
    setfilename("")
    forceUpdate()
  }
  const onUpload = async e => {
    const file = e.target.files[0]
    e.target.value = null // reset the value so the same file can be uploaded again...
    if (file) setfilename(file.name)
    const reader = new FileReader()
    reader.onload = () => setdata(reader.result as string)
    reader.readAsText(file)
  }
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-3">
    <Card.Header><Trans t={t} i18nKey="settings:uploadCard.title" /></Card.Header>
    <Card.Body>
      <Form.File
        className="mb-2"
        label={filename ? filename : <Trans t={t} i18nKey="settings:uploadCard.hint" />}
        onChange={onUpload}
        custom
        accept=".json"
      />
      <h6><Trans t={t} i18nKey="settings:uploadCard.hintPaste" /></h6>
      <textarea className="w-100 text-monospace mb-2" value={data} onChange={e => setdata(e.target.value)} style={{ minHeight: "10em" }} />
      {UploadInfo(dataObj) ?? errorMsg}
    </Card.Body>
    {UploadAction(dataObj, reset)}
  </Card>
}

function UploadInfo(data: UploadData | undefined) {
  switch (data?.type) {
    case "GO": return <GOUploadInfo data={data} />
    case "GOOD": return <GOODUploadInfo data={data} />
  }
}
function UploadAction(data: UploadData | undefined, reset: () => void) {
  switch (data?.type) {
    case "GO":
    case "GOOD": return <GOUploadAction data={data} reset={reset} />
  }
}

function GOODUploadInfo({ data: { source, artifacts, characters, weapons }, data }: { data: GOODImportResult }) {
  const { t } = useTranslation("settings")
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="uploadCard.dbSource" /> <strong>{source}</strong></Card.Header>
    <Card.Body className="mb-n2">
      <MergeResult result={artifacts} type="arts" />
      <MergeResult result={weapons} type="weapons" />
      <MergeResult result={characters} type="chars" />
    </Card.Body>
  </Card>
}
function MergeResult({ result, type }: { result?: ImportResultCounter, type: string }) {
  const { t } = useTranslation("settings")
  if (!result) return null
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Card.Header><Trans t={t} i18nKey={`count.${type}`} /> {result.total ?? 0}</Card.Header>
    <Card.Body className="mb-n2">
      <Row xs={12} md={4} className="mb-2">
        <Col><Trans t={t} i18nKey="count.new" /> <strong>{result.new}</strong> / {result.total}</Col>
        <Col><Trans t={t} i18nKey="count.updated" /> <strong>{result.updated}</strong> / {result.total}</Col>
        <Col><Trans t={t} i18nKey="count.unchanged" /> <strong>{result.unchanged}</strong> / {result.total}</Col>
        <Col className="text-warning"><Trans t={t} i18nKey="count.removed" /> <strong>{result.removed}</strong></Col>
      </Row>
      {!!result.invalid?.length && <div>
        <h6 className="text-danger"><Trans t={t} i18nKey="count.invalid" /> <strong>{result.invalid.length}</strong> / {result.total}</h6>
        <textarea className="w-100 text-monospace mb-2" value={JSON.stringify(result.invalid, undefined, 2)} disabled style={{ minHeight: "10em" }} />
      </div>}
    </Card.Body>
  </Card>
}
function GOUploadInfo({ data: { charCount, artCount } }: { data: GOImportResult }) {
  const { t } = useTranslation("settings")
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="uploadCard.goUpload.title" /></Card.Header>
    <Card.Body><Row>
      <Col xs={12} md={6}><Trans t={t} i18nKey="count.chars" /> {charCount}</Col>
      <Col xs={12} md={6}><Trans t={t} i18nKey="count.arts" /> {artCount}</Col>
      {<Col xs={12} ><Alert variant="warning" className="mb-0 mt-2"><Trans t={t} i18nKey="uploadCard.goUpload.migrate" /></Alert></Col>}
    </Row></Card.Body>
  </Card>
}

function GOUploadAction({ data: { storage }, data, reset }: { data: GOImportResult | GOODImportResult, reset: () => void }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation("settings")
  const dataValid = data.type === "GO" ? data.charCount || data.artCount : (data.characters?.total || data.artifacts?.total || data.weapons?.total)
  const replaceDB = () => {
    dbStorage.removeForKeys(k => k.startsWith("artifact_") || k.startsWith("char_") || k.startsWith("weapon_"))
    dbStorage.copyFrom(storage)
    database.reloadStorage()
    reset()
  }

  return <Card.Footer>
    <Button variant={dataValid ? "success" : "danger"} disabled={!dataValid} onClick={replaceDB}><FontAwesomeIcon icon={faFileUpload} /> <Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
  </Card.Footer>
}

type UploadData = GOImportResult | GOODImportResult