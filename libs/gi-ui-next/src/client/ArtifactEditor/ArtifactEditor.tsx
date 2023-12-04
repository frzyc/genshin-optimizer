import type { RarityKey } from '@genshin-optimizer/consts'
import {
  allElementWithPhyKeys,
  artMaxLevel,
  artSlotMainKeys,
  type ArtifactRarity,
  type ArtifactSetKey,
} from '@genshin-optimizer/consts'
import type { Processed } from '@genshin-optimizer/gi-art-scanner'
import { ScanningQueue } from '@genshin-optimizer/gi-art-scanner'
import { artifactAsset } from '@genshin-optimizer/gi-assets'
import type { Artifact } from '@genshin-optimizer/gi-frontend-gql'
import type { IArtifact } from '@genshin-optimizer/gi-good'
import { allStats } from '@genshin-optimizer/gi-stats'
import { StatIcon } from '@genshin-optimizer/gi-svgicons'
import { ArtifactSetSlotName } from '@genshin-optimizer/gi-ui'
import {
  getArtifactEfficiency,
  getArtifactMeta,
  getMainStatDisplayStr,
} from '@genshin-optimizer/gi-util'
import {
  CardThemed,
  DropdownButton,
  ModalWrapper,
} from '@genshin-optimizer/ui-common'
import { clamp, range } from '@genshin-optimizer/util'
import AddIcon from '@mui/icons-material/Add'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material'
import type { ChangeEvent, MouseEvent } from 'react'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import CloseButton from '../CloseButton'
import { GenshinUserContext } from '../GenshinUserDataWrapper'
import { ImageIcon } from '../ImageIcon'
import { IArtifactToArtifact, findDupArtifact } from '../artifactUtil'
import { assetWrapper } from '../util'
import { AddArtifactButton } from './AddArtifactButton'
import ArtifactRarityDropdown from './ArtifactRarityDropdown'
import ArtifactSetAutocomplete from './ArtifactSetAutocomplete'
import ArtifactSlotDropdown from './ArtifactSlotDropdown'
import {
  ArtifactColoredIconStatWithUnit,
  ArtifactStatWithUnit,
} from './ArtifactStatKeyDisplay'
import ExistingArtDisplay from './ExistingArtDisplay'
import { ScanDisplay, ScannedTextCard } from './ScanDisplay'
import { textsFromImage } from './ScanningUtil'
import SubstatEfficiencyDisplayCard from './SubstatEfficiencyDisplayCard'
import SubstatInput from './SubstatInput'
import { UpdateArtifactButton } from './UpdateArtifactButton'
import { artifactReducer } from './reducer'
import ReplayIcon from '@mui/icons-material/Replay'
import UpdateIcon from '@mui/icons-material/Update'
import { LocationAutocomplete } from '../LocationAutocomplete'
const queue = new ScanningQueue(
  textsFromImage,
  process.env.NODE_ENV === 'development'
)

export function ArtifactEditor({
  artifact: artifactProp,
}: {
  artifact?: Partial<Artifact>
}) {
  const [show, setShow] = useState(false)
  const [artifact, dispatchArtifact] = useReducer(
    artifactReducer,
    {} as Partial<Artifact>
  )
  const [{ processedNum, outstandingNum, scanningNum }, setScanningData] =
    useState({ processedNum: 0, outstandingNum: 0, scanningNum: 0 })
  const [scannedData, setScannedData] = useState(
    undefined as undefined | Omit<Processed, 'artifact'>
  )
  const { artifacts } = useContext(GenshinUserContext)
  const { t } = useTranslation('artifact')

  const allowUpload = !artifact.id
  const disableSet = !!artifactProp?.location
  const disableSlot = !!artifactProp?.location
  const queueTotal = processedNum + outstandingNum + scanningNum
  // If required fields exist, return a "full artifact"
  const artifactFull = useMemo(() => {
    if (
      !artifact.setKey ||
      !artifact.slotKey ||
      !artifact.rarity ||
      !artifact.mainStatKey ||
      !artifact.substats ||
      artifact.level === undefined
    )
      return undefined
    return artifact as Artifact
  }, [artifact])

  // calculate the metadata associated with current artifact
  const { artifactMeta, errors } = useMemo(() => {
    if (!artifactFull) return { artifactMeta: undefined, errors: [] }
    return getArtifactMeta(artifactFull as IArtifact)
  }, [artifactFull])
  const isValid = !errors.length

  // calculate efficiency based on artifactMeta
  const { currentEfficiency, maxEfficiency } = useMemo(() => {
    if (!artifactMeta || !artifactFull)
      return {
        currentEfficiency: 0,
        maxEfficiency: 0,
      }
    const { currentEfficiency, maxEfficiency } = getArtifactEfficiency(
      artifactFull as IArtifact,
      artifactMeta
    )

    return {
      currentEfficiency,
      maxEfficiency,
    }
  }, [artifactFull, artifactMeta])

  // calculate dups
  const {
    old,
    oldType,
  }: {
    old?: Artifact
    oldType?: 'edit' | 'duplicate' | 'upgrade'
  } = useMemo(() => {
    if (!artifactFull) return {}
    if (artifactFull.id) {
      const existingArt = artifacts?.find((a) => a.id === artifactFull.id)
      if (existingArt) return { old: existingArt, oldType: 'edit' }
    }
    // make sure
    if (!artifacts) return {}
    const { duplicated, upgraded } = findDupArtifact(artifactFull, artifacts)
    if (!duplicated.length && !upgraded.length) return {}
    return {
      old: duplicated[0] ?? upgraded[0],
      oldType: duplicated.length !== 0 ? 'duplicate' : 'upgrade',
    }
  }, [artifactFull, artifacts])

  const onReset = useCallback(() => {
    setScannedData(undefined)
    if (artifact.id && artifactProp && artifact.id === artifactProp.id)
      dispatchArtifact({ type: 'overwrite', artifact: artifactProp })
    else dispatchArtifact({ type: 'reset' })
  }, [artifactProp, artifact.id])

  const onClearQueue = useCallback(() => {
    onReset()
    queue.clearQueue()
  }, [onReset])

  // close the editor
  const onClose = useCallback(
    (e?: MouseEvent<HTMLButtonElement>) => {
      if (
        queueTotal &&
        !window.confirm(
          'There are still screenshots processsing. Do you want to close the artifact editor?'
        )
      ) {
        e?.preventDefault()
        return
      }
      setShow(false)
      onClearQueue()
    },
    [queueTotal, setShow, onClearQueue]
  )

  const uploadFiles = useCallback(
    (files?: FileList | null) => {
      if (!files) return
      setShow(true)
      queue.addFiles(Array.from(files).map((f) => ({ f, fName: f.name })))
    },
    [setShow]
  )

  const onUpload = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target) return
      uploadFiles(e.target.files)
      e.target.value = '' // reset the value so the same file can be uploaded again...
    },
    [uploadFiles]
  )

  // small utility function to update artifact
  const update = useCallback(
    (artifact: Partial<Artifact>) =>
      dispatchArtifact({ type: 'update', artifact }),
    []
  )

  // When prop artifact updates, update the state of the artifact in editor
  useEffect(() => {
    if (!artifactProp) return
    dispatchArtifact({
      type: 'overwrite',
      artifact: structuredClone(artifactProp),
    })
    setShow(true)
  }, [artifactProp, setShow])

  // When there is scanned artifacts and no artifact in editor, put latest scanned artifact in editor
  useEffect(() => {
    if (!processedNum || scannedData) return
    const processed = queue.shiftProcessed()
    if (!processed) return
    const { artifact: scannedArt, ...rest } = processed
    setScannedData(rest)
    dispatchArtifact({
      type: 'overwrite',
      artifact: IArtifactToArtifact(scannedArt),
    })
  }, [processedNum, scannedData, dispatchArtifact])

  // register and handle the paste event
  useEffect(() => {
    const pasteFunc = (e: Event) =>
      // setTimeout(() => {
      //   // set a delay so that the artifactEditor UI pops up
      uploadFiles((e as ClipboardEvent).clipboardData?.files)
    // }, 100)
    allowUpload && window.addEventListener('paste', pasteFunc)
    return () => {
      if (allowUpload) window.removeEventListener('paste', pasteFunc)
    }
  }, [uploadFiles, allowUpload])

  // register callback to scanning queue
  useEffect(() => {
    queue.callback = setScanningData
    return () => {
      queue.callback = () => {}
    }
  }, [])

  return (
    <ModalWrapper open={show} onClose={() => onClose()}>
      <CardThemed>
        <CardHeader
          title={
            <Trans t={t} i18nKey="editor.title">
              Artifact Editor
            </Trans>
          }
          action={<CloseButton disabled={!!queueTotal} onClick={onClose} />}
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Grid container spacing={1} columns={{ xs: 1, md: 2 }}>
            {/* Left column */}
            <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
              <LeftEditor
                artifact={artifact}
                disableSlot={disableSlot}
                disableSet={disableSet}
                update={update}
              />

              {/* Current/Max Substats Efficiency */}
              <SubstatEfficiencyDisplayCard
                valid={isValid}
                efficiency={currentEfficiency}
                t={t}
              />
              {currentEfficiency !== maxEfficiency && (
                <SubstatEfficiencyDisplayCard
                  max
                  valid={isValid}
                  efficiency={maxEfficiency}
                  t={t}
                />
              )}

              {/* Image OCR */}
              {allowUpload && (
                <ScanDisplay
                  scannedData={scannedData}
                  processedNum={processedNum}
                  outstandingNum={outstandingNum}
                  scanningNum={scanningNum}
                  onUpload={onUpload}
                  onClearQueue={onClearQueue}
                />
              )}
            </Grid>

            {/* Right column */}
            <Grid item xs={1} display="flex" flexDirection="column" gap={1}>
              {/* substat selections */}
              {artifactMeta &&
                range(0, Math.min(artifact.substats?.length ?? 0, 3)).map(
                  (index) => (
                    <SubstatInput
                      key={index}
                      index={index}
                      artifact={artifact}
                      artifactMeta={artifactMeta}
                      setSubstat={(index, substat) =>
                        dispatchArtifact({ type: 'substat', index, substat })
                      }
                    />
                  )
                )}
              {scannedData?.texts && (
                <ScannedTextCard texts={scannedData?.texts} />
              )}
            </Grid>
          </Grid>

          {/* Duplicate/Updated/Edit UI */}
          {!!artifactFull && (
            <ExistingArtDisplay
              artifact={artifactFull}
              old={old}
              oldType={oldType}
              t={t}
            />
          )}

          {/* Error alert */}
          {!isValid && (
            <Alert variant="filled" severity="error">
              {errors.map((e, i) => (
                <div key={i}>{e}</div>
              ))}
            </Alert>
          )}

          {/* Buttons */}
          <Box display="flex" gap={2}>
            {!!old && (
              <UpdateArtifactButton
                artifact={{ ...old, ...artifactFull }}
                startIcon={<UpdateIcon />}
                afterUpdate={() => {
                  dispatchArtifact({
                    type: 'overwrite',
                    artifact: { ...old, ...artifactFull },
                  })
                  if (artifact.id) onClose()
                  onReset()
                }}
                disabled={!isValid}
                color="primary"
              >
                {t`editor.btnSave`}
              </UpdateArtifactButton>
            )}
            {!artifact.id && (
              <AddArtifactButton
                artifact={artifactFull}
                startIcon={<AddIcon />}
                afterAdd={() => {
                  if (artifact.id) onClose()
                  onReset()
                }}
                disabled={!isValid}
                // warn user not to add if there is
                color={oldType === 'duplicate' ? 'warning' : 'primary'}
              >
                {t`editor.btnAdd`}
              </AddArtifactButton>
            )}
            {/* clear button */}
            {!artifact.id && (
              <Button
                startIcon={<ReplayIcon />}
                disabled={!artifact.setKey}
                onClick={onReset}
                color="error"
              >{t`editor.btnClear`}</Button>
            )}
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function LeftEditor({
  artifact,
  update,
  disableSet,
  disableSlot,
}: {
  artifact: Partial<Artifact>
  update: (a: Partial<Artifact>) => void
  disableSet: boolean
  disableSlot: boolean
}) {
  const { t } = useTranslation('artifact')
  const { setKey, rarity, level, mainStatKey, slotKey, lock, location } =
    artifact
  const disableEditSlot = disableSet || disableSlot
  const setACDisable = useCallback(
    (key: ArtifactSetKey) => {
      //Disable being able to select any of the prayer set unless the current slotkey is circlet
      if (
        disableEditSlot &&
        slotKey !== 'circlet' &&
        (key === 'PrayersForDestiny' ||
          key === 'PrayersForIllumination' ||
          key === 'PrayersForWisdom' ||
          key === 'PrayersToSpringtime')
      )
        return true
      return false
    },
    [disableEditSlot, slotKey]
  )

  return (
    <>
      {/* set & rarity */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {/* Artifact Set */}
        <ArtifactSetAutocomplete
          disabled={disableSet}
          size="small"
          artSetKey={artifact?.setKey ?? null}
          setArtSetKey={(setKey) => setKey && update({ setKey })}
          sx={{ flexGrow: 1 }}
          label={artifact?.setKey ? '' : t('editor.unknownSetName')}
          getOptionDisabled={({ key }) => setACDisable(key)}
        />
        {/* rarity dropdown */}
        <ArtifactRarityDropdown
          rarity={(rarity as ArtifactRarity) ?? undefined}
          onRarity={(r) => update({ rarity: r })}
          filter={(r) =>
            !!setKey && allStats.art.data[setKey].rarities.includes(r)
          }
          disabled={!setKey}
        />
      </Box>

      {/* level */}
      <Box component="div" display="flex" gap={1}>
        <TextField
          fullWidth
          size="small"
          value={level ?? 0}
          label="Level"
          type="number"
          inputProps={{
            max: artMaxLevel[rarity as ArtifactRarity],
            min: 0,
          }}
          onChange={(e) =>
            update({
              level: clamp(
                parseInt(e.target.value),
                0,
                artMaxLevel[rarity as ArtifactRarity]
              ),
            })
          }
          disabled={!rarity}
        />
        <ButtonGroup size="small">
          <Button
            onClick={() => level !== undefined && update({ level: level - 1 })}
            disabled={artifact.level === undefined || artifact.level === 0}
          >
            -
          </Button>
          {rarity
            ? range(0, artMaxLevel[rarity as ArtifactRarity], 4).map((i) => (
                <Button
                  key={i}
                  onClick={() => update({ level: i })}
                  disabled={level === i}
                >
                  {i}
                </Button>
              ))
            : null}
          <Button
            onClick={() => level !== undefined && update({ level: level + 1 })}
            disabled={
              artifact.level === undefined ||
              (!!rarity &&
                artifact.level === artMaxLevel[rarity as ArtifactRarity])
            }
          >
            +
          </Button>
        </ButtonGroup>
      </Box>

      {/* slot */}
      <Box component="div" display="flex">
        <ArtifactSlotDropdown
          disabled={disableEditSlot || !setKey}
          slotKey={slotKey}
          onSlot={(slotKey) => slotKey && update({ slotKey })}
        />

        <CardThemed bgt="light" sx={{ p: 1, ml: 1, flexGrow: 1 }}>
          <Suspense fallback={<Skeleton width="60%" />}>
            <Typography
              component="div"
              color="text.secondary"
              display="flex"
              alignItems="center"
            >
              {!!slotKey && !!setKey ? (
                <>
                  <ImageIcon
                    size={2}
                    src={assetWrapper(artifactAsset(setKey, slotKey))}
                  />
                  <ArtifactSetSlotName setKey={setKey} slotKey={slotKey} />
                </>
              ) : (
                t`editor.unknownPieceName`
              )}
            </Typography>
          </Suspense>
        </CardThemed>
      </Box>

      {/* main stat */}
      <Box component="div" display="flex" gap={1}>
        <DropdownButton
          startIcon={
            mainStatKey ? <StatIcon statKey={mainStatKey} /> : undefined
          }
          title={
            <b>
              {mainStatKey ? (
                <ArtifactStatWithUnit statKey={mainStatKey} />
              ) : (
                t`mainStat`
              )}
            </b>
          }
          disabled={!mainStatKey}
          color={
            mainStatKey
              ? allElementWithPhyKeys.find((e) => mainStatKey.includes(e)) ??
                'success'
              : 'primary'
          }
        >
          {!!slotKey &&
            artSlotMainKeys[slotKey].map((k) => (
              <MenuItem
                key={k}
                selected={artifact?.mainStatKey === k}
                disabled={artifact?.mainStatKey === k}
                onClick={() => update({ mainStatKey: k })}
              >
                <ArtifactColoredIconStatWithUnit statKey={k} />
              </MenuItem>
            ))}
        </DropdownButton>
        <CardThemed bgt="light" sx={{ p: 1, flexGrow: 1 }}>
          <Typography color="text.secondary">
            {mainStatKey && rarity && level !== undefined
              ? getMainStatDisplayStr(mainStatKey, rarity as RarityKey, level)
              : t`mainStat`}
          </Typography>
        </CardThemed>
        <Button
          color={lock ? 'success' : 'primary'}
          onClick={() => update({ lock: !lock })}
          disabled={!setKey}
        >
          {lock ? <LockIcon /> : <LockOpenIcon />}
        </Button>
      </Box>
      {/* Location */}
      <LocationAutocomplete
        autoCompleteProps={{ disabled: !setKey }}
        location={location || null}
        setLocation={(location) => {
          update({ location: location ?? undefined })
        }}
      />
    </>
  )
}
