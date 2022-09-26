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
import { dbMetaInit } from '../Database/Data/StateData'
import { ArtCharDatabase, DatabaseContext, DatabaseContextObj } from "../Database/Database"
import { ExtraStorage } from '../Database/DBStorage'
import { exportGOOD } from '../Database/exports/good'
import useBoolState from '../ReactHooks/useBoolState'
import useDBState from '../ReactHooks/useDBState'
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
    const storage = new ExtraStorage(dbName)
    const dbObj = JSON.parse(localStorage.getItem(dbName) ?? `{ "dbIndex": "${index}" }`)
    storage.setStorage(dbObj)

    // A bit of preventive programming
    storage.removeForKeys(k => k.startsWith("extraDatabase_"))
    const db = new ArtCharDatabase(storage)
    storage.saveStorage()
    return db
  })

  return <DatabaseContext.Provider value={{ database, setDatabase }}>
    {children}
  </DatabaseContext.Provider>
}

function DataCard({ index, databaseContextObj }: { index: number, databaseContextObj?: DatabaseContextObj }) {
  const { database, setDatabase } = useContext(DatabaseContext)
  const [{ name, lastEdit }, setDbMeta] = useDBState("dbMeta", dbMetaInit(index))
  const current = !databaseContextObj
  const [uploadOpen, onOpen, onClose] = useBoolState()
  const { t } = useTranslation(["settings"]);
  const numChar = database.chars.keys.length
  const numArt = database.arts.values.length
  const numWeapon = database.weapons.values.length
  const hasData = Boolean(numChar || numArt || numWeapon)
  const copyToClipboard = useCallback(
    () => navigator.clipboard.writeText(JSON.stringify(exportGOOD(database.storage)))
      .then(() => alert("Copied database to clipboard."))
      .catch(console.error),
    [database],
  )
  const onUpload = useCallback(() => {
    onClose()
    if (!current) {
      const storage = database.storage as ExtraStorage
      storage.saveStorage()
    }
  }, [onClose, current, database.storage])

  const onDelete = useCallback(() => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    if (current) {
      database.clear()
      setDatabase(new ArtCharDatabase(database.storage))
    } else {
      const storage = database.storage as ExtraStorage
      const dbName = storage.databaseName
      const extraStorage = new ExtraStorage(dbName)
      extraStorage.setStorage({})
      setDatabase(new ArtCharDatabase(extraStorage))
      localStorage.removeItem(dbName)
    }
  }, [database, current, name, setDatabase])

  const download = useCallback(() => {
    const date = new Date()
    const dateStr = date.toISOString().split(".")[0].replace("T", "_").replaceAll(":", "-")
    const JSONStr = JSON.stringify(exportGOOD(database.storage))
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

    // save current database to appropriate slot
    const dbIndex = parseInt(databaseContextObj.database.storage.getString("dbIndex") || "1")
    const tempStorage = new ExtraStorage(`extraDatabase_${dbIndex}`, databaseContextObj.database.storage)
    tempStorage.removeForKeys(k => k.startsWith("extraDatabase_"))
    tempStorage.saveStorage()

    // clear this slot database
    const storage = database.storage as ExtraStorage
    const dbName = storage.databaseName
    localStorage.removeItem(dbName)

    // swap over database
    databaseContextObj.database.clear()
    databaseContextObj.database.storage.copyFrom(database.storage)
    databaseContextObj.database.storage.set("dbIndex", index)
    databaseContextObj.setDatabase(new ArtCharDatabase(databaseContextObj.database.storage))

  }, [databaseContextObj, database, index])

  const [tempName, setTempName] = useState(name)
  useEffect(() => setTempName(name), [name])

  const onBlur = useCallback(() => {
    setDbMeta({ name: tempName })
    if (!current) (database.storage as ExtraStorage).saveStorage()
  }, [setDbMeta, tempName, database, current])
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
                <UploadCard onReplace={onUpload} />
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
