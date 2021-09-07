import { faCheckSquare, faClipboard, faFileDownload, faFileUpload, faQuestionCircle, faSquare, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useMemo, useState } from "react"
import { Alert, Badge, Button, Card, Col, Container, Dropdown, Form, OverlayTrigger, Popover, Row } from "react-bootstrap"
import ReactGA from 'react-ga'
import { Trans, useTranslation } from "react-i18next"
import { ArtCharDatabase, DatabaseContext } from "../Database/Database"
import { DBStorage, dbStorage } from '../Database/DBStorage'
import { importGO } from '../Database/exim/go'
import { exportGOOD, importGOOD } from '../Database/exim/good'
import { importMona } from '../Database/exim/mona'
import { languageCodeList } from "../i18n"
import { useForceUpdate } from "../Util/ReactUtil"

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
  alert("Copied database to clipboard.")
}
function DownloadCard({ forceUpdate }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation(["settings"]);
  const numChar = database._getCharKeys().length
  const numArt = database._getArts().length
  const downloadValid = Boolean(numChar || numArt)
  const deleteDB = () => {
    deleteDatabase(t, database);
    forceUpdate()
  }
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-3">
    <Card.Header><Trans t={t} i18nKey="downloadCard.databaseDownload" /></Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.chars" /> {numChar}</Col>
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.arts" /> {numArt}</Col>
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
      if (!parsed) {
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
      return { type: "Mona", ...imported }
    } else if ("version" in parsed && "characterDatabase" in parsed && "artifactDatabase" in parsed) {
      // Parse as GO format
      const imported = importGO(parsed)
      if (!imported) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }
      return { type: "GO", ...imported }
    } else if (parsed.format === "GOOD") {
      // Parse as GOOD format
      const imported = importGOOD(parsed)
      if (!imported) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }
      return { type: "GOOD", ...imported }
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
    case "Mona": return <MonaUploadInfo data={data} />
  }
}
function UploadAction(data: UploadData | undefined, reset: () => void) {
  switch (data?.type) {
    case "GO": return <GOUploadAction data={data} reset={reset} />
    case "GOOD": return <GOUploadAction data={data} reset={reset} />
    case "Mona": return <MonaUploadAction data={data} reset={reset} />
  }
}

function GOODUploadInfo({ data: { source, charCount, artCount, weaponCount } }: { data: GOODUploadData }) {
  const { t } = useTranslation("settings")
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="uploadCard.goodUpload.title" /> {!!source && `(${source})`}</Card.Header>
    <Card.Body><Row>
      <Col xs={12} md={4}><Trans t={t} i18nKey="count.chars" /> {charCount}</Col>
      <Col xs={12} md={4}><Trans t={t} i18nKey="count.arts" /> {artCount}</Col>
      <Col xs={12} md={4}><Trans t={t} i18nKey="count.weapons" /> {weaponCount}</Col>
    </Row></Card.Body>
  </Card>
}
function GOUploadInfo({ data: { charCount, artCount } }: { data: GOUploadData }) {
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
function MonaUploadInfo({ data: { totalCount, newCount, upgradeCount, dupCount, oldIds, invalidCount, } }: { data: MonaUploadData }) {
  const { t } = useTranslation("settings")
  return <Card bg="darkcontent" text={"lightfont" as any}>
    <Card.Header><Trans t={t} i18nKey="uploadCard.monaUpload.title" /></Card.Header>
    <Card.Body>
      <Row>
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.artsDup" /> <strong>{dupCount} / {totalCount}</strong></Col>
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.artsNew" /> <strong>{newCount} / {totalCount}</strong></Col>
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.artsUpg" /> <strong>{upgradeCount} / {totalCount}</strong></Col>
        {!!invalidCount && <Col xs={12} md={6} className="text-danger"><Trans t={t} i18nKey="count.artsInvalid" /> <strong>{invalidCount}</strong></Col>}
        <Col xs={12} md={6}><Trans t={t} i18nKey="count.artsFod" /> <strong>{oldIds.size}</strong></Col>
      </Row>
    </Card.Body>
  </Card>
}

function GOUploadAction({ data: { storage, charCount, artCount }, reset }: { data: Omit<GOUploadData, "type">, reset: () => void }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation("settings")
  const dataValid = charCount || artCount
  const replaceDB = () => {
    if (!window.confirm(t`uploadCard.goUpload.deleteDatabasePrompt`)) return
    dbStorage.clear()
    dbStorage.copyFrom(storage)
    database.reloadStorage()
    reset()
  }

  return <Card.Footer>
    <Button variant={dataValid ? "success" : "danger"} disabled={!dataValid} onClick={replaceDB}><FontAwesomeIcon icon={faFileUpload} /> <Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
  </Card.Footer>
}
function MonaUploadAction({ data: { storage, oldIds, }, reset }: { data: MonaUploadData, reset: () => void }) {
  const database = useContext(DatabaseContext)
  const { t } = useTranslation("settings")
  const [deleteExistingArtifacts, setDeleteExistingArtifacts] = useState(false);

  const importArtifacts = () => {
    if (deleteExistingArtifacts && !window.confirm(t`uploadCard.monaUpload.deleteExistingPrompt`)) {
      setDeleteExistingArtifacts(false);
      return;
    }
    if (deleteExistingArtifacts) {
      // Since it wasn't decided whether to delete old entries when we create
      // the Storage, we defer the deletion to here. This way, we can also
      // share the Storage for both `delete` and `keep` options.
      for (const id of oldIds)
        storage.remove(id)
    }

    dbStorage.clear()
    dbStorage.copyFrom(storage)
    database.reloadStorage()
    reset()
  }

  return <Card.Footer>
    <Button variant={"success"} onClick={() => importArtifacts()}><FontAwesomeIcon icon={faFileUpload} /> <Trans t={t} i18nKey="uploadCard.monaUpload.import" /></Button>
    <Button className="float-right text-right" variant={deleteExistingArtifacts ? "danger" : "primary"} onClick={() => setDeleteExistingArtifacts(value => !value)}>
      <span><FontAwesomeIcon icon={deleteExistingArtifacts ? faCheckSquare : faSquare} className="fa-fw" /> <Trans t={t} i18nKey="uploadCard.monaUpload.deleteExistingButton" /></span>
      <OverlayTrigger
        overlay={<Popover id="deleting-explanation">
          <Popover.Content><Trans t={t} i18nKey="uploadCard.monaUpload.deleteExistingExplanation" /></Popover.Content>
        </Popover>} >
        <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
      </OverlayTrigger>
    </Button>
  </Card.Footer>
}

type GOODUploadData = {
  type: "GOOD", storage: DBStorage,
  source: string,
  charCount: number,
  artCount: number,
  weaponCount: number,
  migrated: boolean
}
type GOUploadData = {
  type: "GO", storage: DBStorage,
  charCount: number,
  artCount: number,
}
type MonaUploadData = {
  type: "Mona", storage: DBStorage,
  totalCount: number,
  newCount: number,
  upgradeCount: number,
  dupCount: number,
  oldIds: Set<string>,
  invalidCount: number,
}
type UploadData = GOUploadData | GOODUploadData | MonaUploadData
