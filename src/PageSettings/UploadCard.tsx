import { faArrowLeft, faFileCode, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CheckBox, CheckBoxOutlineBlank, FileOpen } from '@mui/icons-material'
import { Box, Button, CardContent, Divider, Grid, styled, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import { ArtCharDatabase, DatabaseContext } from "../Database/Database"
import { SandboxStorage } from '../Database/DBStorage'
import { ImportResult, ImportResultCounter } from '../Database/exim'

const InvisInput = styled('input')({
  display: 'none',
});

export default function UploadCard({ onReplace }: { onReplace: () => void }) {
  const { database } = useContext(DatabaseContext)
  const { t } = useTranslation("settings");
  const [data, setdata] = useState("")
  const [filename, setfilename] = useState("")
  const [errorMsg, setErrorMsg] = useState("") // TODO localize error msg
  const [keepNotInImport, setKeepNotInImport] = useState(false)
  const [ignoreDups, setIgnoreDups] = useState(false)
  const { importResult, importedDatabase } = useMemo(() => {
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
    if (parsed.format === "GOOD") {
      // Parse as GOOD format
      const copyStorage = new SandboxStorage()
      copyStorage.copyFrom(database.storage)
      const importedDatabase = new ArtCharDatabase(copyStorage)
      const importResult = importedDatabase.importGOOD(parsed, keepNotInImport, ignoreDups)
      if (!importResult) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }

      return { importResult, importedDatabase }
    }
    setErrorMsg("uploadCard.error.unknown")
    return
  }, [data, database, keepNotInImport, ignoreDups]) ?? {}
  const reset = () => {
    setdata("")
    setfilename("")
    onReplace()
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
            <Button component="span" color="info" startIcon={<FileOpen />}>{t`uploadCard.buttons.open`}</Button>
          </label>
        </Grid>
        <Grid item flexGrow={1}>
          <CardDark sx={{ px: 2, py: 1 }}>
            <Typography>{filename ? <span><FontAwesomeIcon icon={faFileCode} /> {filename}</span> : <span><FontAwesomeIcon icon={faArrowLeft} /> <Trans t={t} i18nKey="settings:uploadCard.hint" /></span>}</Typography>
          </CardDark>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Tooltip title={<Typography>
          {ignoreDups ? t`uploadCard.tooltip.ignoreDup` : t`uploadCard.tooltip.detectdup`}
        </Typography>} placement='top' arrow >
          <Box sx={{ flexGrow: 1, flexBasis: "10em" }}><Button fullWidth disabled={!data} color={ignoreDups ? "primary" : "success"} onClick={() => setIgnoreDups(!ignoreDups)} startIcon={ignoreDups ? <CheckBoxOutlineBlank /> : <CheckBox />}>
            {t`uploadCard.buttons.detectDups`}
          </Button></Box>
        </Tooltip>
        <Tooltip title={<Typography>
          {keepNotInImport ? t`uploadCard.tooltip.keepNotInImport` : t`uploadCard.tooltip.delNotInImport`}
        </Typography>} placement='top' arrow >
          <Box sx={{ flexGrow: 1, flexBasis: "10em" }}><Button fullWidth disabled={!data} color={keepNotInImport ? "primary" : "success"} onClick={() => setKeepNotInImport(!keepNotInImport)} startIcon={keepNotInImport ? <CheckBoxOutlineBlank /> : <CheckBox />} >
            {t`uploadCard.buttons.delNotInImport`}
          </Button></Box>
        </Tooltip>
      </Box>
      <Typography gutterBottom variant="caption"><Trans t={t} i18nKey="settings:uploadCard.hintPaste" /></Typography>
      <Box component="textarea" sx={{ width: "100%", fontFamily: "monospace", minHeight: "10em", mb: 2, resize: "vertical" }} value={data} onChange={e => setdata(e.target.value)} />
      {(importResult && importedDatabase) ? <GOODUploadInfo importResult={importResult} importedDatabase={importedDatabase} /> : t(errorMsg)}
    </CardContent>
    <GOUploadAction importedDatabase={importedDatabase} reset={reset} />
  </CardLight>
}

function GOODUploadInfo({ importResult: { source, artifacts, characters, weapons }, importedDatabase }: { importResult: ImportResult, importedDatabase: ArtCharDatabase }) {
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
          <MergeResult result={artifacts} dbTotal={importedDatabase.arts.values.length} type="arts" />
        </Grid>
        <Grid item flexGrow={1}>
          <MergeResult result={weapons} dbTotal={importedDatabase.weapons.values.length} type="weapons" />
        </Grid>
        <Grid item flexGrow={1}>
          <MergeResult result={characters} dbTotal={importedDatabase.chars.values.length} type="chars" />
        </Grid>
      </Grid>
    </CardContent>
  </CardDark>
}
function MergeResult({ result, dbTotal, type }: { result: ImportResultCounter<any>, dbTotal: number, type: string }) {
  const { t } = useTranslation("settings")
  const total = result.import
  return <CardLight >
    <CardContent sx={{ py: 1 }}>
      <Typography>
        <Trans t={t} i18nKey={`count.${type}`} /> {total}
      </Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Typography><Trans t={t} i18nKey="count.new" /> <strong>{result.new.length}</strong> / {total}</Typography>
      <Typography><Trans t={t} i18nKey="count.unchanged" /> <strong>{result.unchanged.length}</strong> / {total}</Typography>
      <Typography><Trans t={t} i18nKey="count.upgraded" /> <strong>{result.upgraded.length}</strong> / {total}</Typography>
      {/* <Typography><Trans t={t} i18nKey="count.updated" /> <strong>{result.update.length}</strong></Typography> */}
      {!!result.remove.length && <Typography color="warning.main"><Trans t={t} i18nKey="count.removed" /> <strong>{result.remove.length}</strong></Typography>}
      {!!result.notInImport && <Typography><Trans t={t} i18nKey="count.notInImport" /> <strong>{result.notInImport}</strong></Typography>}
      <Typography><Trans t={t} i18nKey="count.dbTotal" /> <strong>{result.beforeMerge}</strong> -&gt; <strong>{dbTotal}</strong></Typography>
      {!!result.invalid?.length && <div>
        <Typography color="error.main"><Trans t={t} i18nKey="count.invalid" /> <strong>{result.invalid.length}</strong> / {total}</Typography>
        <Box component="textarea" sx={{ width: "100%", fontFamily: "monospace", minHeight: "10em", resize: "vertical" }} value={JSON.stringify(result.invalid, undefined, 2)} disabled />
      </div>}
    </CardContent>
  </CardLight>
}

function GOUploadAction({ importedDatabase, reset }: { importedDatabase?: ArtCharDatabase, reset: () => void }) {
  const { database, setDatabase } = useContext(DatabaseContext)
  const { t } = useTranslation("settings")
  const replaceDB = useCallback(() => {
    if (!importedDatabase) return
    database.clear()
    database.storage.copyFrom(importedDatabase.storage)
    setDatabase(new ArtCharDatabase(database.storage))
    reset()
  }, [database, importedDatabase, reset, setDatabase])


  return <><Divider /><CardContent sx={{ py: 1 }}>
    <Button color={importedDatabase ? "success" : "error"} disabled={!importedDatabase} onClick={replaceDB} startIcon={<FontAwesomeIcon icon={faFileUpload} />}><Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
  </CardContent></>
}
