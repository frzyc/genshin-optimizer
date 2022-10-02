import { faClipboard } from '@fortawesome/free-solid-svg-icons'
import { Delete, Download, ImportExport, Upload } from '@mui/icons-material'
import { Button, CardContent, Chip, Divider, Grid, Typography } from '@mui/material'
import { Box } from '@mui/system'
import { useCallback, useContext, useEffect, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import { StyledInputBase } from '../Components/CustomNumberInput'
import FontAwesomeSvgIcon from '../Components/FontAwesomeSvgIcon'
import ModalWrapper from '../Components/ModalWrapper'
import { ArtCharDatabase, DatabaseContext, DatabaseContextObj } from "../Database/Database"
import { SandboxStorage } from '../Database/DBStorage'
import useBoolState from '../ReactHooks/useBoolState'
import useDBMeta from '../ReactHooks/useDBMeta'
import { range } from '../Util/Util'
import UploadCard from './UploadCard'

export default function DatabaseCard() {
  const databaseContextObj = useContext(DatabaseContext)
  const dbIndex = parseInt(databaseContextObj.database.storage.getString("dbIndex") || "1")
  const { t } = useTranslation(["settings"]);

  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="subtitle1">
        {t`DatabaseCard.title`}
      </Typography>
    </CardContent>
    <Divider />
    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={2} columns={{ xs: 1, md: 2, }}>
        {range(1, 4).map(i => <Grid key={i} item xs={1}>
          {i === dbIndex ? <DataCard index={i} /> :
            <ExtraDatabaseWrapper index={i}>
              <DataCard index={i} databaseContextObj={databaseContextObj} />
            </ExtraDatabaseWrapper>}
        </Grid>)}
      </Grid>
    </CardContent >
  </CardLight >
}
function ExtraDatabaseWrapper({ index, children }) {
  const [database, setDatabase] = useState(() => {
    const dbName = `extraDatabase_${index}`
    const eDB = localStorage.getItem(dbName)
    const dbObj = eDB ? JSON.parse(eDB) : { dbIndex: `${index}` }
    const db = new ArtCharDatabase(new SandboxStorage(dbObj))
    db.toExtraLocalDB()
    return db
  })

  return <DatabaseContext.Provider value={{ database, setDatabase }}>
    {children}
  </DatabaseContext.Provider>
}

function DataCard({ index, databaseContextObj }: { index: number, databaseContextObj?: DatabaseContextObj }) {
  const { database } = useContext(DatabaseContext)
  const { name, lastEdit } = useDBMeta()

  const current = !databaseContextObj
  const [uploadOpen, onOpen, onClose] = useBoolState()
  const { t } = useTranslation(["settings"]);
  const numChar = database.chars.keys.length
  const numArt = database.arts.values.length
  const numWeapon = database.weapons.values.length
  const hasData = Boolean(numChar || numArt || numWeapon)
  const copyToClipboard = useCallback(
    () => navigator.clipboard.writeText(JSON.stringify(database.exportGOOD()))
      .then(() => alert("Copied database to clipboard."))
      .catch(console.error),
    [database],
  )

  const onDelete = useCallback(() => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    database.rmExtraLocalDB()
    database.clear()
  }, [database, name])

  const download = useCallback(() => {
    const date = new Date()
    const dateStr = date.toISOString().split(".")[0].replace("T", "_").replaceAll(":", "-")
    const JSONStr = JSON.stringify(database.exportGOOD())
    const filename = `${name.trim().replaceAll(" ", "_")}_${dateStr}.json`
    const contentType = "application/json;charset=utf-8"
    const a = document.createElement('a');
    a.download = filename
    a.href = `data:${contentType},${encodeURIComponent(JSONStr)}`
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [database, name])

  const onSwap = useCallback(() => {
    if (!databaseContextObj) return
    databaseContextObj.database.toExtraLocalDB()
    database.swapStorage(databaseContextObj.database)
    databaseContextObj.setDatabase(database)
  }, [databaseContextObj, database])

  const [tempName, setTempName] = useState(name)
  useEffect(() => setTempName(name), [name])

  const onBlur = useCallback(() => {
    database.dbMeta.set({ name: tempName })
    database.toExtraLocalDB()
  }, [tempName, database])
  const onKeyDOwn = useCallback(e => e.key === "Enter" && onBlur(), [onBlur],)

  return <CardDark sx={{ height: "100%", boxShadow: current ? "0px 0px 0px 2px green inset" : undefined }}>
    <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
      < StyledInputBase value={tempName} sx={{ borderRadius: 1, px: 1, flexGrow: 1 }} onChange={(e) => setTempName(e.target.value)} onBlur={onBlur} onKeyDown={onKeyDOwn} />
      {!current && <Button startIcon={<ImportExport />} onClick={onSwap} color="warning">{t`DatabaseCard.button.swap`}</Button>}
      <Chip color={current ? "success" : "secondary"} label={current ? t`DatabaseCard.currentDB` : `${t`DatabaseCard.title`} ${index}`} />
    </CardContent>
    <Divider />
    <CardContent>
      <Box display="flex" gap={2}>
        <Box flexGrow={1}>
          <Typography noWrap><Trans t={t} i18nKey="count.chars" /> <strong>{numChar}</strong></Typography>
          <Typography noWrap><Trans t={t} i18nKey="count.arts" /> <strong>{numArt}</strong></Typography>
          <Typography noWrap><Trans t={t} i18nKey="count.weapons" /> <strong>{numWeapon}</strong></Typography>
          {!!lastEdit && <Typography noWrap><strong>{(new Date(lastEdit).toLocaleString())}</strong></Typography>}
        </Box>
        <Box>
          <Grid container spacing={1} columns={{ xs: 2 }} >
            <Grid item xs={1}>
              <Button fullWidth disabled={!hasData} color="info" onClick={copyToClipboard} startIcon={<FontAwesomeSvgIcon icon={faClipboard} />}>
                <Trans t={t} i18nKey="DatabaseCard.button.copy" />
              </Button>
            </Grid>
            <Grid item xs={1}>
              <ModalWrapper open={uploadOpen} onClose={onClose} >
                <UploadCard onReplace={onClose} />
              </ModalWrapper>
              <Button fullWidth component="span" color="info" startIcon={<Upload />} onClick={onOpen}>
                {t`DatabaseCard.button.upload`}
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button fullWidth disabled={!hasData} onClick={download} startIcon={<Download />}>
                {t`DatabaseCard.button.download`}
              </Button>
            </Grid>
            <Grid item xs={1}>
              <Button fullWidth disabled={!hasData} color="error" onClick={onDelete} startIcon={<Delete />}>
                {t`DatabaseCard.button.delete`}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </CardContent>
  </CardDark>
}
