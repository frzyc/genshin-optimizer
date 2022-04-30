import { faClipboard, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Download } from '@mui/icons-material'
import { Button, CardContent, Divider, Grid, Typography } from '@mui/material'
import { useCallback, useContext } from "react"
import { Trans, useTranslation } from "react-i18next"
import CardLight from '../Components/Card/CardLight'
import { ArtCharDatabase, DatabaseContext } from "../Database/Database"
import { exportGOOD } from '../Database/exports/good'

export default function DownloadCard() {
  const { database, setDatabase } = useContext(DatabaseContext)
  const { t } = useTranslation(["settings"]);
  const numChar = database._getCharKeys().length
  const numArt = database._getArts().length
  const numWeapon = database._getWeapons().length
  const downloadValid = Boolean(numChar || numArt)
  const deleteDB = useCallback(() => {
    database.storage.clear()
    setDatabase(new ArtCharDatabase(database.storage))
  }, [database, setDatabase])
  const copyToClipboard = useCallback(
    () => navigator.clipboard.writeText(JSON.stringify(exportGOOD(database.storage)))
      .then(() => alert("Copied database to clipboard."))
      .catch(console.error),
    [database],
  )
  const download = useCallback(
    () => {
      const date = new Date()
      const dateStr = date.toISOString().split(".")[0].replace("T", "_").replaceAll(":", "-")
      const JSONStr = JSON.stringify(exportGOOD(database.storage))
      const filename = `go-data_${dateStr}.json`
      const contentType = "application/json;charset=utf-8"
      const a = document.createElement('a');
      a.download = filename
      a.href = `data:${contentType},${encodeURIComponent(JSONStr)}`
      a.target = "_blank"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    },
    [database],
  )


  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography variant="subtitle1">
        <Trans t={t} i18nKey="downloadCard.databaseDownload" />
      </Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container mb={2} spacing={2}>
        <Grid item xs={6} md={4}><Typography><Trans t={t} i18nKey="count.chars" /> {numChar}</Typography></Grid>
        <Grid item xs={6} md={4}><Typography><Trans t={t} i18nKey="count.arts" /> {numArt}</Typography></Grid>
        <Grid item xs={6} md={4}><Typography><Trans t={t} i18nKey="count.weapons" /> {numWeapon}</Typography></Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent sx={{ py: 1 }}>
      <Grid container spacing={2}>
        <Grid item><Button disabled={!downloadValid} onClick={download} startIcon={<Download />}><Trans t={t} i18nKey="downloadCard.button.download" /></Button></Grid>
        <Grid item flexGrow={1} ><Button disabled={!downloadValid} color="info" onClick={copyToClipboard} startIcon={<FontAwesomeIcon icon={faClipboard} />}><Trans t={t} i18nKey="downloadCard.button.copy" /></Button></Grid>
        <Grid item><Button disabled={!downloadValid} color="error" onClick={deleteDB} startIcon={<FontAwesomeIcon icon={faTrashAlt} />}><Trans t={t} i18nKey="downloadCard.button.delete" /></Button></Grid>
      </Grid>
    </CardContent>
  </CardLight>
}
