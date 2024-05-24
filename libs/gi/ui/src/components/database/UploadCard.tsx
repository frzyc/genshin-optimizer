import { SandboxStorage } from '@genshin-optimizer/common/database'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  ArtCharDatabase,
  type ImportResult,
  type ImportResultCounter,
  type MergeResultCounter,
} from '@genshin-optimizer/gi/db'
import { DatabaseContext } from '@genshin-optimizer/gi/db-ui'
import { CheckBox, CheckBoxOutlineBlank, FileOpen } from '@mui/icons-material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'

const InvisInput = styled('input')({
  display: 'none',
})

export function UploadCard({
  index,
  onReplace,
}: {
  index: number
  onReplace: () => void
}) {
  const { databases } = useContext(DatabaseContext)
  const database = databases[index]
  const { t } = useTranslation('settings')
  const [data, setdata] = useState('')
  const [filename, setfilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('') // TODO localize error msg
  const [keepNotInImport, setKeepNotInImport] = useState(false)
  const [ignoreDups, setIgnoreDups] = useState(false)
  const { importResult, importedDatabase } =
    useMemo(() => {
      if (!data) return undefined
      let parsed: any
      try {
        parsed = JSON.parse(data)
        if (typeof parsed !== 'object') {
          setErrorMsg('uploadCard.error.jsonParse')
          return undefined
        }
      } catch (e) {
        setErrorMsg('uploadCard.error.jsonParse')
        return undefined
      }
      // Figure out the file format
      if (parsed.format === 'GOOD') {
        // Parse as GOOD format
        const copyStorage = new SandboxStorage()
        copyStorage.copyFrom(database.storage)
        const importedDatabase = new ArtCharDatabase(
          (index + 1) as 1 | 2 | 3 | 4,
          copyStorage
        )
        const importResult = importedDatabase.importGOOD(
          parsed,
          keepNotInImport,
          ignoreDups
        )
        if (!importResult) {
          setErrorMsg('uploadCard.error.goInvalid')
          return undefined
        }

        return { importResult, importedDatabase }
      }
      setErrorMsg('uploadCard.error.unknown')
      return undefined
    }, [data, database, keepNotInImport, ignoreDups, index]) ?? {}
  const reset = () => {
    setdata('')
    setfilename('')
    onReplace()
  }
  const onUpload = async (e) => {
    const file = e.target.files[0]
    e.target.value = null // reset the value so the same file can be uploaded again...
    if (file) setfilename(file.name)
    const reader = new FileReader()
    reader.onload = () => setdata(reader.result as string)
    reader.readAsText(file)
  }
  const onDrop = async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    e.target.value = null // reset the value so the same file can be uploaded again...
    if (file) setfilename(file.name)
    const reader = new FileReader()
    reader.onload = () => setdata(reader.result as string)
    reader.readAsText(file)
  }
  return (
    <CardThemed
      bgt="light"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      sx={{ height: '100%' }}
    >
      <CardContent sx={{ py: 1 }}>
        <Trans t={t} i18nKey="settings:uploadCard.title" />
      </CardContent>
      <CardContent>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item>
            <label htmlFor="icon-button-file">
              <InvisInput
                accept=".json"
                id="icon-button-file"
                type="file"
                onChange={onUpload}
              />
              <Button
                component="span"
                color="info"
                startIcon={<FileOpen />}
              >{t`uploadCard.buttons.open`}</Button>
            </label>
          </Grid>
          <Grid item flexGrow={1}>
            <CardThemed sx={{ px: 2, py: 1 }}>
              <Typography>
                {filename ? (
                  <span>
                    <TextSnippetIcon {...iconInlineProps} /> {filename}
                  </span>
                ) : (
                  <span>
                    <ArrowBackIcon {...iconInlineProps} />{' '}
                    <Trans t={t} i18nKey="settings:uploadCard.hint" />
                  </span>
                )}
              </Typography>
            </CardThemed>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip
            title={
              <Typography>
                {ignoreDups
                  ? t`uploadCard.tooltip.ignoreDup`
                  : t`uploadCard.tooltip.detectdup`}
              </Typography>
            }
            placement="top"
            arrow
          >
            <Box sx={{ flexGrow: 1, flexBasis: '10em' }}>
              <Button
                fullWidth
                disabled={!data}
                color={ignoreDups ? 'primary' : 'success'}
                onClick={() => setIgnoreDups(!ignoreDups)}
                startIcon={ignoreDups ? <CheckBoxOutlineBlank /> : <CheckBox />}
              >
                {t`uploadCard.buttons.detectDups`}
              </Button>
            </Box>
          </Tooltip>
          <Tooltip
            title={
              <Typography>
                {keepNotInImport
                  ? t`uploadCard.tooltip.keepNotInImport`
                  : t`uploadCard.tooltip.delNotInImport`}
              </Typography>
            }
            placement="top"
            arrow
          >
            <Box sx={{ flexGrow: 1, flexBasis: '10em' }}>
              <Button
                fullWidth
                disabled={!data}
                color={keepNotInImport ? 'primary' : 'success'}
                onClick={() => setKeepNotInImport(!keepNotInImport)}
                startIcon={
                  keepNotInImport ? <CheckBoxOutlineBlank /> : <CheckBox />
                }
              >
                {t`uploadCard.buttons.delNotInImport`}
              </Button>
            </Box>
          </Tooltip>
        </Box>
        <Typography gutterBottom variant="caption">
          <Trans t={t} i18nKey="settings:uploadCard.hintPaste" />
        </Typography>
        <Box
          component="textarea"
          sx={{
            width: '100%',
            fontFamily: 'monospace',
            minHeight: '10em',
            mb: 2,
            resize: 'vertical',
          }}
          value={data}
          onChange={(e) => setdata(e.target.value)}
        />
        {importResult && importedDatabase ? (
          <GOODUploadInfo
            importResult={importResult}
            importedDatabase={importedDatabase}
          />
        ) : (
          t(errorMsg)
        )}
      </CardContent>
      <GOUploadAction
        index={index}
        importedDatabase={importedDatabase}
        reset={reset}
      />
    </CardThemed>
  )
}

function GOODUploadInfo({
  importResult: {
    source,
    artifacts,
    characters,
    weapons,
    builds,
    buildTcs,
    teamChars,
    teams,
  },
  importedDatabase,
}: {
  importResult: ImportResult
  importedDatabase: ArtCharDatabase
}) {
  const { t } = useTranslation('settings')
  return (
    <CardThemed>
      <CardContent sx={{ py: 1 }}>
        <Typography>
          <Trans t={t} i18nKey="uploadCard.dbSource" />
          <strong> {source}</strong>
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid container item spacing={2}>
            <Grid item flexGrow={1}>
              <MergeResult
                result={artifacts}
                dbTotal={importedDatabase.arts.values.length}
                type="arts"
              />
            </Grid>
            <Grid item flexGrow={1}>
              <MergeResult
                result={weapons}
                dbTotal={importedDatabase.weapons.values.length}
                type="weapons"
              />
            </Grid>
            <Grid item flexGrow={1}>
              <MergeResult
                result={characters}
                dbTotal={importedDatabase.chars.values.length}
                type="chars"
              />
            </Grid>
          </Grid>
          <Grid container item spacing={2}>
            <Grid item flexGrow={1}>
              <MergeResult
                result={teams}
                dbTotal={importedDatabase.teams.values.length}
                type="teams"
              />
            </Grid>
            <Grid item flexGrow={1}>
              <MergeResult
                result={teamChars}
                dbTotal={importedDatabase.teamChars.values.length}
                type="loadouts"
              />
            </Grid>
            <Grid item flexGrow={1}>
              <MergeResult
                result={builds}
                dbTotal={importedDatabase.builds.entries.length}
                type="builds"
              />
            </Grid>
            <Grid item flexGrow={1}>
              <MergeResult
                result={buildTcs}
                dbTotal={importedDatabase.buildTcs.entries.length}
                type="buildTcs"
              />
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </CardThemed>
  )
}
function MergeResult({
  result,
  dbTotal,
  type,
}: {
  result: MergeResultCounter<any> | ImportResultCounter
  dbTotal: number
  type: string
}) {
  const { t } = useTranslation('settings')
  const total = result.import
  return (
    <CardThemed bgt="light">
      <CardContent sx={{ py: 1 }}>
        <Typography>
          <Trans t={t} i18nKey={`count.${type}`} /> {total}
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        {'new' in result && (
          <Typography>
            <Trans t={t} i18nKey="count.new" />{' '}
            <strong>{result.new.length}</strong> / {total}
          </Typography>
        )}
        {'unchanged' in result && (
          <Typography>
            <Trans t={t} i18nKey="count.unchanged" />{' '}
            <strong>{result.unchanged.length}</strong> / {total}
          </Typography>
        )}
        {'upgraded' in result && (
          <Typography>
            <Trans t={t} i18nKey="count.upgraded" />{' '}
            <strong>{result.upgraded.length}</strong> / {total}
          </Typography>
        )}
        {/* <Typography><Trans t={t} i18nKey="count.updated" /> <strong>{result.update.length}</strong></Typography> */}
        {'remove' in result && !!result.remove.length && (
          <Typography color="warning.main">
            <Trans t={t} i18nKey="count.removed" />{' '}
            <strong>{result.remove.length}</strong>
          </Typography>
        )}
        {'notInImport' in result && !!result.notInImport && (
          <Typography>
            <Trans t={t} i18nKey="count.notInImport" />{' '}
            <strong>{result.notInImport}</strong>
          </Typography>
        )}
        <Typography>
          <Trans t={t} i18nKey="count.dbTotal" />{' '}
          <strong>
            {'beforeImport' in result
              ? result.beforeImport
              : result.beforeMerge}
          </strong>{' '}
          -&gt; <strong>{dbTotal}</strong>
        </Typography>
        {'invalid' in result && !!result.invalid?.length && (
          <div>
            <Typography color="error.main">
              <Trans t={t} i18nKey="count.invalid" />{' '}
              <strong>{result.invalid.length}</strong> / {total}
            </Typography>
            <Box
              component="textarea"
              sx={{
                width: '100%',
                fontFamily: 'monospace',
                minHeight: '10em',
                resize: 'vertical',
              }}
              value={JSON.stringify(result.invalid, undefined, 2)}
              disabled
            />
          </div>
        )}
      </CardContent>
    </CardThemed>
  )
}

function GOUploadAction({
  index,
  importedDatabase,
  reset,
}: {
  index: number
  importedDatabase?: ArtCharDatabase
  reset: () => void
}) {
  const { databases, setDatabase } = useContext(DatabaseContext)
  const database = databases[index]
  const { t } = useTranslation('settings')
  const replaceDB = useCallback(() => {
    if (!importedDatabase) return
    importedDatabase.swapStorage(database)
    setDatabase(index, importedDatabase)
    importedDatabase.toExtraLocalDB()
    reset()
  }, [database, index, importedDatabase, reset, setDatabase])

  return (
    <>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <Button
          color={importedDatabase ? 'success' : 'error'}
          disabled={!importedDatabase}
          onClick={replaceDB}
          startIcon={<UploadFileIcon />}
        >
          <Trans t={t} i18nKey="settings:uploadCard.replaceDatabase" />
        </Button>
      </CardContent>
    </>
  )
}
