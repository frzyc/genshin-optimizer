import { faArrowLeft, faFileCode, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Upload } from '@mui/icons-material'
import { Alert, Box, Button, CardContent, Divider, Grid, styled, Typography } from '@mui/material'
import { useContext, useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../../Components/Card/CardDark'
import CardLight from '../../Components/Card/CardLight'
import { DatabaseContext } from "../../Database/Database"
import { dbStorage } from '../../Database/DBStorage'
import { importGO, ImportResult as GOImportResult } from '../../Database/exim/go'
import { importGOOD, ImportResult as GOODImportResult, ImportResultCounter } from '../../Database/exim/good'
import { importMona } from '../../Database/exim/mona'

const InvisInput = styled('input')({
  display: 'none',
});

export default function UploadCard({ forceUpdate }) {
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
  return <CardLight>
    <CardContent sx={{ py: 1 }}><Trans t={t} i18nKey="settings:uploadCard.title" /></CardContent>
    <CardContent>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item>
          <label htmlFor="icon-button-file">
            <InvisInput accept=".json" id="icon-button-file" type="file" onChange={onUpload} />
            <Button component="span" startIcon={<Upload />}>Upload</Button>
          </label>
        </Grid>
        <Grid item flexGrow={1}>
          <CardDark sx={{ px: 2, py: 1 }}>
            <Typography>{filename ? <span><FontAwesomeIcon icon={faFileCode} /> {filename}</span> : <span><FontAwesomeIcon icon={faArrowLeft} /> <Trans t={t} i18nKey="settings:uploadCard.hint" /></span>}</Typography>
          </CardDark>
        </Grid>
      </Grid>
      <Typography gutterBottom variant="caption"><Trans t={t} i18nKey="settings:uploadCard.hintPaste" /></Typography>
      <Box component="textarea" sx={{ width: "100%", fontFamily: "monospace", minHeight: "10em", mb: 2, resize: "vertical" }} value={data} onChange={e => setdata(e.target.value)} />
      {UploadInfo(dataObj) ?? errorMsg}
    </CardContent>
    {UploadAction(dataObj, reset)}
  </CardLight>
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
  return <CardDark>
    <CardContent sx={{ py: 1 }}>
      <Typography>
        <Trans t={t} i18nKey="uploadCard.dbSource" /><strong> {source}</strong>
      </Typography>
    </CardContent>
    <Divider />
    <CardContent >
      <Grid container spacing={2}>
        <Grid item flexGrow={1}>
          <MergeResult result={artifacts} type="arts" />
        </Grid>
        <Grid item flexGrow={1}>
          <MergeResult result={weapons} type="weapons" />
        </Grid>
        <Grid item flexGrow={1}>
          <MergeResult result={characters} type="chars" />
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}
function MergeResult({ result, type }: { result?: ImportResultCounter, type: string }) {
  const { t } = useTranslation("settings")
  if (!result) return null
  return <CardLight >
    <CardContent sx={{ py: 1 }}>
      <Typography>
        <Trans t={t} i18nKey={`count.${type}`} /> {result.total ?? 0}
      </Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Typography><Trans t={t} i18nKey="count.new" /> <strong>{result.new}</strong> / {result.total}</Typography>
      <Typography><Trans t={t} i18nKey="count.updated" /> <strong>{result.updated}</strong> / {result.total}</Typography>
      <Typography><Trans t={t} i18nKey="count.unchanged" /> <strong>{result.unchanged}</strong> / {result.total}</Typography>
      <Typography color="warning.main"><Trans t={t} i18nKey="count.removed" /> <strong>{result.removed}</strong></Typography>
      {!!result.invalid?.length && <div>
        <Typography color="error.main"><Trans t={t} i18nKey="count.invalid" /> <strong>{result.invalid.length}</strong> / {result.total}</Typography>
        <Box component="textarea" sx={{ width: "100%", fontFamily: "monospace", minHeight: "10em", resize: "vertical" }} value={JSON.stringify(result.invalid, undefined, 2)} disabled />
      </div>}
    </CardContent>
  </CardLight>
}
function GOUploadInfo({ data: { charCount, artCount } }: { data: GOImportResult }) {
  const { t } = useTranslation("settings")
  return <CardDark>
    <CardContent sx={{ py: 1 }}>
      <Trans t={t} i18nKey="uploadCard.goUpload.title" />
    </CardContent>
    <Divider />
    <CardContent><Grid container spacing={1}>
      <Grid item xs={12} md={6}> <Typography><Trans t={t} i18nKey="count.chars" /> {charCount}</Typography></Grid>
      <Grid item xs={12} md={6}> <Typography><Trans t={t} i18nKey="count.arts" /> {artCount}</Typography></Grid>
      {<Grid item xs={12} ><Alert severity="warning" ><Trans t={t} i18nKey="uploadCard.goUpload.migrate" /></Alert></Grid>}
    </Grid></CardContent>
  </CardDark>
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

  return <><Divider /><CardContent sx={{ py: 1 }}>
    <Button color={dataValid ? "success" : "error"} disabled={!dataValid} onClick={replaceDB} startIcon={<FontAwesomeIcon icon={faFileUpload} />}><Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
  </CardContent></>
}

type UploadData = GOImportResult | GOODImportResult