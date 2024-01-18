import { BuildAlert, initialBuildStatus } from '@genshin-optimizer/gi-ui'
import {
  getMainStatDisplayValue,
  getSubstatValue,
} from '@genshin-optimizer/gi-util'
import { useBoolState } from '@genshin-optimizer/react-util'
import { objMap, toPercent } from '@genshin-optimizer/util'
import { CopyAll, Refresh } from '@mui/icons-material'
import CalculateIcon from '@mui/icons-material/Calculate'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Link,
  Skeleton,
  Stack,
  ToggleButton,
} from '@mui/material'
import {
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import CardLight from '../../../../Components/Card/CardLight'
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent'
import CustomNumberInput from '../../../../Components/CustomNumberInput'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup'
import { CharacterContext } from '../../../../Context/CharacterContext'
import type { dataContextObj } from '../../../../Context/DataContext'
import { DataContext } from '../../../../Context/DataContext'
import { initCharTC } from '../../../../Database/DataManagers/CharacterTCData'
import { DatabaseContext } from '../../../../Database/Database'
import { constant, percent } from '../../../../Formula/utils'
import useDBMeta from '../../../../ReactHooks/useDBMeta'
import useTeamData from '../../../../ReactHooks/useTeamData'
import type { ICachedArtifact } from '../../../../Types/artifact'
import type { ICharTC } from '../../../../Types/character'
import type { ICachedWeapon } from '../../../../Types/weapon'
import { isDev } from '../../../../Util/Util'
import { defaultInitialWeaponKey } from '../../../../Util/WeaponUtil'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import { ArtifactMainStatAndSetEditor } from './ArtifactMainStatAndSetEditor'
import { ArtifactSubCard } from './ArtifactSubCard'
import { BuildConstaintCard } from './BuildConstaintCard'
import type { SetCharTCAction } from './CharTCContext'
import { CharTCContext } from './CharTCContext'
import GcsimButton from './GcsimButton'
import { WeaponEditorCard } from './WeaponEditorCard'
import kqmIcon from './kqm.png'
import type { TCWorkerResult } from './optimizeTc'
import { optimizeTcGetNodes } from './optimizeTc'
import useCharTC from './useCharTC'
export default function TabTheorycraft() {
  const { t } = useTranslation('page_character')
  const { database } = useContext(DatabaseContext)
  const { data: oldData } = useContext(DataContext)
  const { gender } = useDBMeta()
  const {
    character,
    character: { key: characterKey, compareData },
    characterSheet,
    characterDispatch,
  } = useContext(CharacterContext)
  const charTC = useCharTC(
    characterKey,
    defaultInitialWeaponKey(characterSheet.weaponTypeKey)
  )
  const setCharTC = useCallback(
    (data: SetCharTCAction) => {
      database.charTCs.set(characterKey, data)
    },
    [characterKey, database]
  )
  const valueCharTCContext = useMemo(
    () => ({ charTC, setCharTC }),
    [charTC, setCharTC]
  )
  const resetData = useCallback(() => {
    setCharTC(initCharTC(defaultInitialWeaponKey(characterSheet.weaponTypeKey)))
  }, [setCharTC, characterSheet])

  const copyFrom = useCallback(
    (eWeapon: ICachedWeapon, build: ICachedArtifact[]) => {
      const newData = initCharTC(eWeapon.key)
      newData.artifact.substats.type = charTC.artifact.substats.type

      newData.weapon.level = eWeapon.level
      newData.weapon.ascension = eWeapon.ascension
      newData.weapon.refinement = eWeapon.refinement

      const sets = {}
      build.forEach((art) => {
        if (!art) return
        const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
        newData.artifact.slots[slotKey].level = level
        newData.artifact.slots[slotKey].statKey = mainStatKey
        newData.artifact.slots[slotKey].rarity = rarity
        sets[setKey] = (sets[setKey] ?? 0) + 1
        substats.forEach((substat) => {
          if (substat.key)
            newData.artifact.substats.stats[substat.key] =
              (newData.artifact.substats.stats[substat.key] ?? 0) +
              substat.accurateValue
        })
      })
      newData.artifact.sets = Object.fromEntries(
        Object.entries(sets)
          .map(([key, value]) => [
            key,
            value === 3
              ? 2
              : value === 5
              ? 4
              : value === 1 && !(key as string).startsWith('PrayersFor')
              ? 0
              : value,
          ])
          .filter(([, value]) => value)
      )
      setCharTC(newData)
    },
    [charTC, setCharTC]
  )
  const location = useLocation()
  const { build: locBuild } = (location.state as
    | { build: string[] }
    | undefined) ?? { build: undefined }
  useEffect(() => {
    if (!locBuild) return
    const eWeapon = database.weapons.get(character.equippedWeapon)!
    copyFrom(
      eWeapon,
      locBuild.map((i) => database.arts.get(i)!)
    )
    // WARNING: if copyFrom is included, it will cause a render loop due to its setData <---> data
    // eslint-disable-next-line
  }, [locBuild, database])

  const copyFromEquipped = useCallback(() => {
    const eWeapon = database.weapons.get(character.equippedWeapon)!
    copyFrom(
      eWeapon,
      Object.values(character.equippedArtifacts)
        .map((a) => database.arts.get(a)!)
        .filter((a) => a)
    )
  }, [
    database,
    character.equippedArtifacts,
    character.equippedWeapon,
    copyFrom,
  ])

  const deferredData = useDeferredValue(charTC)
  const overriderArtData = useMemo(() => {
    const stats = { ...deferredData.artifact.substats.stats }
    Object.values(deferredData.artifact.slots).forEach(
      ({ statKey, rarity, level }) =>
        (stats[statKey] =
          (stats[statKey] ?? 0) +
          getMainStatDisplayValue(statKey, rarity, level))
    )
    return {
      art: objMap(stats, (v, k) =>
        k.endsWith('_') ? percent(v / 100) : constant(v)
      ),
      artSet: objMap(deferredData.artifact.sets, (v) => constant(v)),
    }
  }, [deferredData])

  const overrideWeapon: ICachedWeapon = useMemo(
    () => ({
      id: '',
      location: '',
      key: charTC.weapon.key,
      level: charTC.weapon.level,
      ascension: charTC.weapon.ascension,
      refinement: charTC.weapon.refinement,
      lock: false,
    }),
    [charTC]
  )
  const teamData = useTeamData(
    characterKey,
    0,
    overriderArtData,
    overrideWeapon
  )

  const { target: charUIData } = teamData?.[characterKey] ?? {}

  const dataContextValue: dataContextObj | undefined = useMemo(() => {
    if (!teamData || !charUIData) return undefined
    return {
      data: charUIData,
      teamData,
    }
  }, [charUIData, teamData])
  const dataContextValueWithOld: dataContextObj | undefined = useMemo(() => {
    if (!dataContextValue) return undefined
    return {
      ...dataContextValue,
      oldData: compareData ? oldData : undefined,
    }
  }, [dataContextValue, compareData, oldData])

  const optimizationTarget = charTC.optimization.target
  const setOptimizationTarget = useCallback(
    (optimizationTarget: ICharTC['optimization']['target']) => {
      const data_ = structuredClone(charTC)
      data_.optimization.target = optimizationTarget
      setCharTC(data_)
    },
    [charTC, setCharTC]
  )

  const distributedSubstats = charTC.optimization.distributedSubstats
  const setDistributedSubstats = useCallback(
    (distributedSubstats: ICharTC['optimization']['distributedSubstats']) => {
      setCharTC((data_) => {
        data_.optimization.distributedSubstats = distributedSubstats
      })
    },
    [setCharTC]
  )
  const workerRef = useRef<Worker>(null)
  if (workerRef.current === null)
    workerRef.current = new Worker(
      new URL('./optimizeTcWorker.ts', import.meta.url)
    )

  const [status, setStatus] = useState(initialBuildStatus())
  const solving = status.type === 'active'

  const terminateWorker = useCallback(() => {
    workerRef.current.terminate()
    setStatus(initialBuildStatus())
  }, [workerRef])

  const optimizeSubstats = (apply: boolean) => {
    const nodes = optimizeTcGetNodes(teamData, characterKey, charTC)
    console.log({ nodes })
    workerRef.current.postMessage({ charTC, ...nodes })
    setStatus((s) => ({
      ...s,
      type: 'active',
      startTime: performance.now(),
      finishTime: undefined,
    }))

    workerRef.current.onmessage = ({ data }: MessageEvent<TCWorkerResult>) => {
      const { resultType } = data
      switch (resultType) {
        case 'total':
          setStatus((s) => ({ ...s, total: data.total }))
          break
        case 'count':
          setStatus((s) => ({
            ...s,
            tested: data.tested,
            failed: data.failed,
          }))
          break
        case 'finalize': {
          const { maxBuffer, distributed, tested, failed, skipped } = data
          setStatus((s) => ({
            ...s,
            type: 'inactive',
            tested,
            failed,
            skipped,
            finishTime: performance.now(),
          }))

          if (!apply) {
            console.log({
              maxBuffer,
              distributed,
              tested,
              failed,
              skipped,
            })
            break
          }

          setCharTC((charTC) => {
            charTC.artifact.substats.stats = objMap(
              charTC.artifact.substats.stats,
              (v, k) => v + toPercent(maxBuffer![k] ?? 0, k)
            )
            charTC.optimization.distributedSubstats =
              distributedSubstats - distributed
            return charTC
          })

          break
        }
      }
    }
  }

  const kqms = useCallback(() => {
    setCharTC((charTC) => {
      charTC.artifact.substats.type = 'mid'

      const {
        artifact: {
          slots,
          substats: { stats, type, rarity },
        },
      } = charTC
      charTC.optimization.distributedSubstats =
        20 - (rarity === 5 ? 0 : rarity === 4 ? 10 : 15)
      charTC.artifact.substats.stats = objMap(stats, (val, statKey) => {
        const substatValue = getSubstatValue(statKey, rarity, type)
        return substatValue * 2
      })
      charTC.optimization.maxSubstats = objMap(
        charTC.optimization.maxSubstats,
        (_val, statKey) => {
          const rollsPerSlot = 2
          const diffSlot = 5
          const sameSlot = Object.entries(slots).filter(
            ([_slotKey, { statKey: mainStatKey }]) => mainStatKey === statKey
          ).length
          // +2 for the inital fixed rolls
          return 2 + (diffSlot - sameSlot) * rollsPerSlot
        }
      )
    })
  }, [setCharTC])

  return (
    <CharTCContext.Provider value={valueCharTCContext}>
      <Stack spacing={1}>
        <CardLight>
          <Box sx={{ display: 'flex', gap: 1, p: 1 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <CopyFromEquippedButton
                action={copyFromEquipped}
                disabled={solving}
              />
              <ResetButton action={resetData} disabled={solving} />
              <KQMSButton action={kqms} disabled={solving} />
              <GcsimButton disabled={solving} />
            </Box>
            <SolidToggleButtonGroup
              exclusive
              value={compareData}
              onChange={(e, v) => characterDispatch({ compareData: v })}
              size="small"
            >
              <ToggleButton value={false} disabled={!compareData}>
                {t`tabTheorycraft.compareToggle.tc`}
              </ToggleButton>
              <ToggleButton value={true} disabled={compareData}>
                {t`tabTheorycraft.compareToggle.equipped`}
              </ToggleButton>
            </SolidToggleButtonGroup>
          </Box>
        </CardLight>
        {dataContextValue ? (
          <DataContext.Provider value={dataContextValue}>
            <Box>
              <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
                <Grid item sx={{ flexGrow: -1, maxWidth: '350px' }}>
                  <WeaponEditorCard
                    weaponTypeKey={characterSheet.weaponTypeKey}
                    disabled={solving}
                  />
                  <BuildConstaintCard disabled={solving} />
                </Grid>
                <Grid item sx={{ flexGrow: -1 }}>
                  <ArtifactMainStatAndSetEditor disabled={solving} />
                </Grid>
                <Grid item sx={{ flexGrow: 1 }}>
                  <ArtifactSubCard disabled={solving} />
                </Grid>
              </Grid>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" gap={1}>
                <OptimizationTargetSelector
                  disabled={solving}
                  optimizationTarget={optimizationTarget}
                  setTarget={(target) => setOptimizationTarget(target)}
                />
                <CustomNumberInput
                  value={distributedSubstats}
                  disabled={!optimizationTarget || solving}
                  onChange={(v) => v !== undefined && setDistributedSubstats(v)}
                  endAdornment={'Substats'}
                  sx={{
                    borderRadius: 1,
                    px: 1,
                    textWrap: 'nowrap',
                    flexShrink: 1,
                  }}
                  inputProps={{
                    sx: {
                      textAlign: 'right',
                      px: 1,
                      width: '3em',
                      minWidth: '3em',
                    },
                    min: 0,
                  }}
                />
                {!solving ? (
                  <Button
                    onClick={() => optimizeSubstats(true)}
                    disabled={!optimizationTarget || !distributedSubstats}
                    color="success"
                    startIcon={<CalculateIcon />}
                  >
                    {t`tabTheorycraft.distribute`}
                  </Button>
                ) : (
                  <Button
                    onClick={terminateWorker}
                    color="error"
                    startIcon={<CloseIcon />}
                  >
                    Cancel
                  </Button>
                )}
              </Box>

              {isDev && (
                <Button
                  onClick={() => optimizeSubstats(false)}
                  disabled={!optimizationTarget || solving}
                >
                  Log Optimized Substats
                </Button>
              )}
              <BuildAlert
                status={status}
                characterKey={characterKey}
                gender={gender}
              />
            </Box>
          </DataContext.Provider>
        ) : (
          <Skeleton variant="rectangular" width="100%" height={500} />
        )}
        <CardLight sx={{ flexGrow: 1, p: 1 }}>
          {dataContextValueWithOld ? (
            <DataContext.Provider value={dataContextValueWithOld}>
              <StatDisplayComponent />
            </DataContext.Provider>
          ) : (
            <Skeleton variant="rectangular" width="100%" height={500} />
          )}
        </CardLight>
      </Stack>
    </CharTCContext.Provider>
  )
}
function CopyFromEquippedButton({
  action,
  disabled,
}: {
  action: () => void
  disabled?: boolean
}) {
  const { t } = useTranslation(['page_character', 'ui'])
  const [open, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button
        color="info"
        onClick={onOpen}
        startIcon={<CopyAll />}
        disabled={disabled}
      >
        {t('tabTheorycraft.copyDialog.copyBtn')}
      </Button>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('tabTheorycraft.copyDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('tabTheorycraft.copyDialog.content')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            {t('ui:close')}
          </Button>
          <Button
            color="success"
            onClick={() => {
              onClose()
              action()
            }}
            autoFocus
          >
            {t('tabTheorycraft.copyDialog.copyBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function ResetButton({
  action,
  disabled,
}: {
  action: () => void
  disabled: boolean
}) {
  const { t } = useTranslation(['page_character', 'ui'])
  const [open, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button
        color="error"
        onClick={onOpen}
        startIcon={<Refresh />}
        disabled={disabled}
      >
        {t('ui:reset')}
      </Button>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('tabTheorycraft.resetDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('tabTheorycraft.resetDialog.content')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            {t('ui:close')}
          </Button>
          <Button
            color="success"
            onClick={() => {
              onClose()
              action()
            }}
            autoFocus
          >
            {t('ui:reset')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

function KQMSButton({
  action,
  disabled,
}: {
  action: () => void
  disabled: boolean
}) {
  const { t } = useTranslation(['page_character', 'ui'])
  const [open, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button
        color="keqing"
        onClick={onOpen}
        startIcon={<ImgIcon src={kqmIcon} />}
        disabled={disabled}
      >
        {t('tabTheorycraft.kqmsDialog.kqmsBtn')}
      </Button>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('tabTheorycraft.kqmsDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans t={t} i18nKey="tabTheorycraft.kqmsDialog.content">
              This will replace your current <strong>substat setup</strong> with
              one that adheres to the{' '}
              <Link
                href="https://compendium.keqingmains.com/kqm-standards"
                target="_blank"
              >
                KQM Standards
              </Link>
              .
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            {t('ui:close')}
          </Button>
          <Button
            color="success"
            onClick={() => {
              onClose()
              action()
            }}
            autoFocus
          >
            {t('tabTheorycraft.kqmsDialog.kqmsBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
