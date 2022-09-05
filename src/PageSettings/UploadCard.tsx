import { faArrowLeft, faFileCode, faFileUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FileOpen, JoinFull, JoinLeft, MergeType, Splitscreen } from '@mui/icons-material'
import { Box, Button, CardContent, Divider, Grid, styled, Tooltip, Typography } from '@mui/material'
import { useCallback, useContext, useMemo, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import { ArtCharDatabase, DatabaseContext } from "../Database/Database"
import { DBLocalStorage, SandboxStorage } from '../Database/DBStorage'
import { ImportResult, ImportResultCounter } from '../Database/exim'
import { importGOOD } from '../Database/imports/good'

const InvisInput = styled('input')({
  display: 'none',
});

export default function UploadCard({ onReplace }: { onReplace: () => void }) {
  const { database } = useContext(DatabaseContext)
  const { t } = useTranslation("settings");
  const [data, setdata] = useState("")
  const [filename, setfilename] = useState("")
  const [errorMsg, setErrorMsg] = useState("") // TODO localize error msg
  const [partial, setPartial] = useState(false)
  const [disjoint, setDisjoint] = useState(false)
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
      const importResult = importGOOD(parsed, importedDatabase, partial, disjoint)
      if (!importResult) {
        setErrorMsg("uploadCard.error.goInvalid")
        return
      }

      return { importResult, importedDatabase }
    }
    setErrorMsg("uploadCard.error.unknown")
    return
  }, [data, database, partial, disjoint]) ?? {}
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
            <Button component="span" startIcon={<FileOpen />}>{t`uploadCard.buttons.open`}</Button>
          </label>
        </Grid>
        <Grid item flexGrow={1}>
          <CardDark sx={{ px: 2, py: 1 }}>
            <Typography>{filename ? <span><FontAwesomeIcon icon={faFileCode} /> {filename}</span> : <span><FontAwesomeIcon icon={faArrowLeft} /> <Trans t={t} i18nKey="settings:uploadCard.hint" /></span>}</Typography>
          </CardDark>
        </Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Tooltip title={<Box><Trans t={t} i18nKey="settings:uploadCard.tooltip.partial" >
          <Typography variant="h6">Full Import</Typography>
          <Typography gutterBottom>Assume the import to be the full inventory. Artifacts/weapons in GO that doesnt exist in the import are deleted.</Typography>
          <Typography variant="h6">Partial Import</Typography>
          <Typography>Assume the import is a partial inventory. Artifacts/weapons are updated/deduplicated(depending on setting), but not deleted.</Typography>
        </Trans></Box>} placement='top' arrow >
          <Box sx={{ flexGrow: 1, flexBasis: "10em" }}><Button fullWidth disabled={!data} onClick={() => setPartial(!partial)} startIcon={partial ? <JoinLeft /> : <JoinFull />} >
            {partial ? t`uploadCard.buttons.partialImport` : t`uploadCard.buttons.fullImport`}
          </Button></Box>
        </Tooltip>
        <Tooltip title={<Box><Trans t={t} i18nKey="settings:uploadCard.tooltip.disjoint" >
          <Typography variant="h6">Merge Import</Typography>
          <Typography gutterBottom>Find upgrade/duplicates in the GO inventory and merge the import into GO.</Typography>
          <Typography variant="h6">Disjoint Import</Typography>
          <Typography>Assume the import does not have any upgrades/duplicates, the import is merged into GO without upgrade/duplicate detection.</Typography>
        </Trans></Box>} placement='top' arrow >
          <Box sx={{ flexGrow: 1, flexBasis: "10em" }}><Button fullWidth disabled={!data} onClick={() => setDisjoint(!disjoint)} startIcon={disjoint ? <Splitscreen /> : <MergeType />}>
            {disjoint ? t`uploadCard.buttons.disjointImport` : t`uploadCard.buttons.mergeImport`}
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
      <Typography><Trans t={t} i18nKey="count.updated" /> <strong>{result.update.length}</strong> / {total}</Typography>
      <Typography><Trans t={t} i18nKey="count.unchanged" /> <strong>{result.unchanged.length}</strong> / {total}</Typography>
      {!!result.remove.length && <Typography color="warning.main"><Trans t={t} i18nKey="count.removed" /> <strong>{result.remove.length}</strong></Typography>}
      {!!result.notInImport && <Typography><Trans t={t} i18nKey="count.notInImport" /> <strong>{result.notInImport}</strong></Typography>}
      <Typography><Trans t={t} i18nKey="count.dbTotal" /> <strong>{dbTotal}</strong></Typography>
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
    const dbLStorage = new DBLocalStorage(localStorage)
    dbLStorage.copyFrom(importedDatabase.storage)
    importedDatabase.storage = dbLStorage
    setDatabase(importedDatabase)
    reset()
  }, [database, importedDatabase, reset, setDatabase])


  return <><Divider /><CardContent sx={{ py: 1 }}>
    <Button color={importedDatabase ? "success" : "error"} disabled={!importedDatabase} onClick={replaceDB} startIcon={<FontAwesomeIcon icon={faFileUpload} />}><Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" /></Button>
  </CardContent></>
}
