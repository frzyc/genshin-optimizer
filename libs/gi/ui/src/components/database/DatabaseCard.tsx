'use client'
import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  CardThemed,
  ModalWrapper,
  StyledInputBase,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import { Delete, Download, ImportExport, Upload } from '@mui/icons-material'
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
import { UploadCard } from './UploadCard'

export function DatabaseCard({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation(['settings'])
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ py: 1 }}>
        <Typography variant="subtitle1">{t('DatabaseCard.title')}</Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Grid container spacing={2} columns={{ xs: 1, md: 2 }}>
          {range(0, 3).map((i) => (
            <Grid key={i} item xs={1}>
              <DataCard index={i} readOnly={readOnly} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </CardThemed>
  )
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
    () => database.dbMeta.follow((_r, dbMeta) => setDBMeta(dbMeta)),
    [database]
  )
  // Need to update the dbMeta when database changes
  useEffect(() => setDBMeta(database.dbMeta.get()), [database])

  const current = mainDB === database
  const [uploadOpen, onOpen, onClose] = useBoolState()
  const { t } = useTranslation(['settings'])
  const numChar = database.chars.keys.length
  const numArt = database.arts.values.length
  const numWeapon = database.weapons.values.length
  const numTeams = database.teams.values.length
  const numLoadouts = database.teamChars.values.length
  const numBuilds = database.builds.values.length
  const hasData = Boolean(
    numChar || numArt || numWeapon || numTeams || numLoadouts || numBuilds
  )
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
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onBlur(),
    [onBlur]
  )

  return (
    <CardThemed
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
          onKeyDown={onKeyDown}
          disabled={readOnly}
        />
        {!current && (
          <Button
            startIcon={<ImportExport />}
            onClick={onSwap}
            color="warning"
            disabled={readOnly}
          >
            {t('DatabaseCard.button.swap')}
          </Button>
        )}
        <Chip
          color={current ? 'success' : 'secondary'}
          label={
            current
              ? t('DatabaseCard.currentDB')
              : `${t('DatabaseCard.title')} ${database.dbIndex}`
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
            <Typography noWrap>
              <Trans t={t} i18nKey="count.teams" /> <strong>{numTeams}</strong>
            </Typography>
            <Typography noWrap>
              <Trans t={t} i18nKey="count.loadouts" />{' '}
              <strong>{numLoadouts}</strong>
            </Typography>
            <Typography noWrap>
              <Trans t={t} i18nKey="count.builds" />{' '}
              <strong>{numBuilds}</strong>
            </Typography>
          </Box>
          <Box>
            <Grid container spacing={1} columns={{ xs: 2 }}>
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
                  {t('DatabaseCard.button.upload')}
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button
                  fullWidth
                  disabled={!hasData}
                  onClick={download}
                  startIcon={<Download />}
                >
                  {t('DatabaseCard.button.download')}
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
                  {t('DatabaseCard.button.delete')}
                </Button>
              </Grid>
            </Grid>
            {!!lastEdit && (
              <Typography noWrap align="center" style={{ paddingTop: '1.5em' }}>
                <strong>{new Date(lastEdit).toLocaleString()}</strong>
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
