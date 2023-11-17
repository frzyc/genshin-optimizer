import type { ArtCharDatabase } from '../Database/Database'
import type { IGOOD } from '@genshin-optimizer/gi-good'
import type { IGO } from '../Database/exim'
import {
  Delete,
  Download,
  ImportExport,
  Upload,
  CloudUpload,
  CloudDownload,
} from '@mui/icons-material'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import {
  Box,
  Button,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import CardDark from '../Components/Card/CardDark'
import CardLight from '../Components/Card/CardLight'
import { StyledInputBase } from '../Components/CustomNumberInput'
import ModalWrapper from '../Components/ModalWrapper'
import { DatabaseContext } from '../Database/Database'
import { useBoolState } from '@genshin-optimizer/react-util'
import { range, shouldShowDevComponents } from '../Util/Util'
import UploadCard from './UploadCard'
import { CloudSyncContext } from '../Context/CloudSyncContext'

const CLIENT_ID = process.env.NX_GOOGLE_CLIENT_ID
const API_KEY = process.env.NX_GOOGLE_API_KEY
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'
const DRIVE_DISCOVERY_DOCS_URL =
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

export default function DatabaseCard({
  readOnly = false,
}: {
  readOnly?: boolean
}) {
  const { t } = useTranslation(['settings'])
  return (
    <CardLight>
      <CardContent sx={{ py: 1 }}>
        <Typography variant="subtitle1">{t`DatabaseCard.title`}</Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
          {range(0, 3).map((i) => (
            <Grid key={i} item xs={1}>
              <DataCard index={i} readOnly={readOnly}  />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardLight>
  )
}

async function createCloudFile(
  database: ArtCharDatabase,
  index: number,
  fileID?: string
) {
  const JSONStr = JSON.stringify(database.exportGOOD())
  if (!fileID) {
    try {
      const { result } = await gapi.client.drive.files.create({
        resource: {
          name: `genshin-optimizer-${index}.json`,
          parents: ['appDataFolder'],
        },
        fields: 'id',
      })
      fileID = result.id
    } catch (e) {
      console.error('create cloud file for id failed', e)
      // TODO: better error handling
      return
    }
  }
  try {
    await gapi.client.request({
      path: `/upload/drive/v3/files/${fileID}`,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: JSONStr,
    })
  } catch (e) {
    console.error('updating cloud file failed', e)
    // TODO: better error handling
  }
}

async function uploadDataToDrive(
  tokenResponse: google.accounts.oauth2.TokenResponse,
  database: ArtCharDatabase,
  index: number,
  setCloudSyncInProgress: (s: boolean) => void,
  callback: () => void
) {
  setCloudSyncInProgress(true)
  if (
    tokenResponse &&
    tokenResponse.access_token &&
    google.accounts.oauth2.hasGrantedAllScopes(tokenResponse, SCOPES)
  ) {
    gapi.client.setApiKey(API_KEY)
    try {
      await gapi.client.load(DRIVE_DISCOVERY_DOCS_URL)
    } catch (e) {
      console.error('loading drive discovery docs failed', e)
      callback()
      // TODO: better error handling
      return
    }

    try {
      // list files to check if file already exists
      const { result } = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name = 'genshin-optimizer-${index}.json'`,
      })

      if (result.files.length > 0) {
        const fileID = result.files[0].id

        const { result: fileResult } = await gapi.client.drive.files.get({
          fileId: fileID,
          alt: 'media',
        })

        const dbFileResult = fileResult as any as IGOOD & IGO

        const artifactCount = dbFileResult.artifacts?.length ?? 0
        const characterCount = dbFileResult.characters?.length ?? 0
        const weaponCount = dbFileResult.weapons?.length ?? 0

        if (
          !window.confirm(
            `Are you sure you want to replace the existing backup? the backup has ` +
              `${artifactCount} artifact(s), ` +
              `${characterCount} character(s), ` +
              `and ${weaponCount} weapon(s).`
          )
        ) {
          callback()
          return
        }
        await createCloudFile(database, index, fileID)
        callback()
      } else {
        await createCloudFile(database, index)
        callback()
      }
    } catch (e) {
      console.error('listing files failed', e)
      callback()
    }
  } else {
    callback()
    // it should be safe to ignore
  }
}

async function downloadDataFromDrive(
  tokenResponse: google.accounts.oauth2.TokenResponse,
  database: ArtCharDatabase,
  index: number,
  setCloudSyncInProgress: (s: boolean) => void,
  callback: () => void
) {
  setCloudSyncInProgress(true)
  if (
    tokenResponse &&
    tokenResponse.access_token &&
    google.accounts.oauth2.hasGrantedAllScopes(tokenResponse, SCOPES)
  ) {
    gapi.client.setApiKey(API_KEY)
    try {
    await gapi.client.load(DRIVE_DISCOVERY_DOCS_URL)
    } catch (e) {
      console.error('loading drive discovery docs failed', e)
      callback()
    }
    try {
      // list files to check if file already exists
      const { result } = await gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        q: `name = 'genshin-optimizer-${index}.json'`,
      })

      if (result.files.length === 0) {
        console.info('downloadDataFromDrive: no file')
        window.alert('No backup found')

        callback()
        // TODO: this happens if file doesn't exist on drive it should have a way to let the user know that
        return
      }
      try {
        const fileID = result.files[0].id
        const { result: fileResult } = await gapi.client.drive.files.get({
          fileId: fileID,
          alt: 'media',
        })

        const dbFileResult = fileResult as any as IGOOD & IGO

        const artifactCount = dbFileResult.artifacts?.length ?? 0
        const characterCount = dbFileResult.characters?.length ?? 0
        const weaponCount = dbFileResult.weapons?.length ?? 0

        if (
          !window.confirm(
            `Are you sure you want to replace the current database with the backup with ` +
              `${artifactCount} artifact(s), ` +
              `${characterCount} character(s), ` +
              `and ${weaponCount} weapon(s)?`
          )
        ) {
          callback()
          return
        }

        database.importGOOD(dbFileResult, true, true)
        callback()
      } catch (e) {
        console.error('downloading cloud file failed', e)
        callback()
        // TODO: better error handling
        return
      }
    } catch (e) {
      console.error('listing files failed', e)
      // TODO: better error handling
      callback()
      return
    }
  } else {
    callback()
    // it should be safe to ignore
  }
}

function DataCard({ index, readOnly }: { index: number; readOnly: boolean }) {
  const {
    databases,
    database: mainDB,
    setDatabase,
  } = useContext(DatabaseContext)
  const database = databases[index]
  const [{ name, lastEdit }, setDBMeta] = useState(database.dbMeta.get())
  useEffect(
    () => database.dbMeta.follow((r, dbMeta) => setDBMeta(dbMeta)),
    [database]
  )
  // Need to update the dbMeta when database changes
  useEffect(() => setDBMeta(database.dbMeta.get()), [database])

  const { cloudSyncInProgress, setCloudSyncInProgress } = useContext(CloudSyncContext)


  const current = mainDB === database
  const [uploadOpen, onOpen, onClose] = useBoolState()
  const { t } = useTranslation(['settings'])
  const numChar = database.chars.keys.length
  const numArt = database.arts.values.length
  const numWeapon = database.weapons.values.length
  const hasData = Boolean(numChar || numArt || numWeapon)
  const copyToClipboard = useCallback(
    () =>
      navigator.clipboard
        .writeText(JSON.stringify(database.exportGOOD()))
        .then(() => alert('Copied database to clipboard.'))
        .catch(console.error),
    [database]
  )

  const onDelete = useCallback(() => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    database.clear()
    database.toExtraLocalDB()
  }, [database, name])

  const onDriveUpload = useCallback(() => {
    const uploadDataWrapper = (
      tokenResponse: google.accounts.oauth2.TokenResponse
    ) => uploadDataToDrive(tokenResponse, database, index, setCloudSyncInProgress, () => setCloudSyncInProgress(false))
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: uploadDataWrapper,
    })
    client.requestAccessToken()
  }, [database, index, setCloudSyncInProgress])

  const onDriveDownload = useCallback(() => {
    const downloadDataWrapper = (
      tokenResponse: google.accounts.oauth2.TokenResponse
    ) => downloadDataFromDrive(tokenResponse, database, index, setCloudSyncInProgress, () => setCloudSyncInProgress(false))
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: downloadDataWrapper,
    })
    client.requestAccessToken()
  }, [database, index, setCloudSyncInProgress])

  const download = useCallback(() => {
    const date = new Date()
    const dateStr = date
      .toISOString()
      .split('.')[0]
      .replace('T', '_')
      .replaceAll(':', '-')
    const JSONStr = JSON.stringify(database.exportGOOD())
    const filename = `${name.trim().replaceAll(' ', '_')}_${dateStr}.json`
    const contentType = 'application/json;charset=utf-8'
    const a = document.createElement('a')
    a.download = filename
    a.href = `data:${contentType},${encodeURIComponent(JSONStr)}`
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [database, name])

  const onSwap = useCallback(() => {
    if (current) return
    mainDB.toExtraLocalDB()
    database.swapStorage(mainDB)
    setDatabase(index, database)
  }, [index, setDatabase, mainDB, current, database])

  const [tempName, setTempName] = useState(name)
  useEffect(() => setTempName(name), [name])

  const onBlur = useCallback(() => {
    database.dbMeta.set({ name: tempName })
    database.toExtraLocalDB()
  }, [tempName, database])
  const onKeyDOwn = useCallback((e) => e.key === 'Enter' && onBlur(), [onBlur])

  return (
    <CardDark
      sx={{
        height: '100%',
        boxShadow: current ? '0px 0px 0px 2px green inset' : undefined,
      }}
    >
      <CardContent
        sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}
      >
        <StyledInputBase
          value={tempName}
          sx={{ borderRadius: 1, px: 1, flexGrow: 1 }}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDOwn}
          disabled={readOnly}
        />
        {!current && (
          <Button
            startIcon={<ImportExport />}
            onClick={onSwap}
            color="warning"
            disabled={readOnly}
          >{t`DatabaseCard.button.swap`}</Button>
        )}
        <Chip
          color={current ? 'success' : 'secondary'}
          label={
            current
              ? t`DatabaseCard.currentDB`
              : `${t`DatabaseCard.title`} ${database.dbIndex}`
          }
        />
      </CardContent>
      <Divider />
      <CardContent>
        <Box display="flex" gap={2}>
          <Box flexGrow={1}>
            <Typography noWrap>
              <Trans t={t} i18nKey="count.chars" /> <strong>{numChar}</strong>
            </Typography>
            <Typography noWrap>
              <Trans t={t} i18nKey="count.arts" /> <strong>{numArt}</strong>
            </Typography>
            <Typography noWrap>
              <Trans t={t} i18nKey="count.weapons" />{' '}
              <strong>{numWeapon}</strong>
            </Typography>
            {!!lastEdit && (
              <Typography noWrap>
                <strong>{new Date(lastEdit).toLocaleString()}</strong>
              </Typography>
            )}
          </Box>
          <Box>
            <Grid container spacing={1} columns={{ xs: 2 }}>
              <Grid item xs={1}>
                <ModalWrapper open={uploadOpen} onClose={onClose}>
                  <UploadCard index={index} onReplace={onClose} />
                </ModalWrapper>
                <Button
                  fullWidth
                  component="span"
                  color="info"
                  startIcon={<Upload />}
                  onClick={onOpen}
                  disabled={readOnly}
                >
                  {t`DatabaseCard.button.upload`}
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button
                  fullWidth
                  disabled={!hasData}
                  onClick={download}
                  startIcon={<Download />}
                >
                  {t`DatabaseCard.button.download`}
                </Button>
              </Grid>
              {shouldShowDevComponents ? (
                <Grid item xs={1}>
                  <Button
                    fullWidth
                    color="info"
                    disabled={!hasData || readOnly || cloudSyncInProgress}
                    onClick={onDriveUpload}
                    startIcon={<CloudUpload />}
                  >
                    {t`DatabaseCard.button.uploadDrive`}
                  </Button>
                </Grid>
              ) : undefined}
              {shouldShowDevComponents ? (
                <Grid item xs={1}>
                  <Button
                    fullWidth
                    disabled={readOnly || cloudSyncInProgress}
                    onClick={onDriveDownload}
                    startIcon={<CloudDownload />}
                  >
                    {t`DatabaseCard.button.downloadDrive`}
                  </Button>
                </Grid>
              ) : undefined}
              <Grid item xs={1}>
                <Button
                  fullWidth
                  disabled={!hasData}
                  color="info"
                  onClick={copyToClipboard}
                  startIcon={<ContentPasteIcon />}
                >
                  <Trans t={t} i18nKey="DatabaseCard.button.copy" />
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button
                  fullWidth
                  disabled={!hasData || readOnly}
                  color="error"
                  onClick={onDelete}
                  startIcon={<Delete />}
                >
                  {t`DatabaseCard.button.delete`}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </CardContent>
    </CardDark>
  )
}
