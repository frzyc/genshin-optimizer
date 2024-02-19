import { useBoolState } from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { objMap, toPercent } from '@genshin-optimizer/common/util'
import {
  artSubstatRollData,
  type SubstatKey,
} from '@genshin-optimizer/gi/consts'
import type {
  ICachedArtifact,
  ICachedWeapon,
  ICharTC,
} from '@genshin-optimizer/gi/db'
import { initCharTC } from '@genshin-optimizer/gi/db'
import { useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { BuildAlert, initialBuildStatus } from '@genshin-optimizer/gi/ui'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import { CopyAll, Refresh } from '@mui/icons-material'
import CalculateIcon from '@mui/icons-material/Calculate'
import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
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
import { ArtifactStatWithUnit } from '../../../../Components/Artifact/ArtifactStatKeyDisplay'
import CardLight from '../../../../Components/Card/CardLight'
import StatDisplayComponent from '../../../../Components/Character/StatDisplayComponent'
import CustomNumberInput from '../../../../Components/CustomNumberInput'
import SolidToggleButtonGroup from '../../../../Components/SolidToggleButtonGroup'
import { CharacterContext } from '../../../../Context/CharacterContext'
import type { dataContextObj } from '../../../../Context/DataContext'
import { DataContext } from '../../../../Context/DataContext'
import { OptimizationTargetContext } from '../../../../Context/OptimizationTargetContext'
import useTeamData, {
  getTeamDataCalc,
} from '../../../../ReactHooks/useTeamData'
import { isDev } from '../../../../Util/Util'
import { defaultInitialWeaponKey } from '../../../../Util/WeaponUtil'
import OptimizationTargetSelector from '../TabOptimize/Components/OptimizationTargetSelector'
import { ArtifactMainStatAndSetEditor } from './ArtifactMainStatAndSetEditor'
import { ArtifactSubCard } from './ArtifactSubCard'
import { BuildConstaintCard } from './BuildConstaintCard'
import type { SetCharTCAction } from './CharTCContext'
import { CharTCContext } from './CharTCContext'
import GcsimButton from './GcsimButton'
import KQMSButton from './KQMSButton'
import { WeaponEditorCard } from './WeaponEditorCard'
import type { TCWorkerResult } from './optimizeTc'
import {
  getArtifactData,
  getMinSubAndOtherRolls,
  getScalesWith,
  getWeaponData,
  optimizeTcGetNodes,
} from './optimizeTc'
import useCharTC from './useCharTC'
export default function TabTheorycraft() {
  const { t } = useTranslation('page_character')
  const database = useDatabase()
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
    (eWeapon: ICachedWeapon, build: ICachedArtifact[]) =>
      setCharTC((charTC) => {
        charTC.weapon.key = eWeapon.key
        charTC.weapon.level = eWeapon.level
        charTC.weapon.ascension = eWeapon.ascension
        charTC.weapon.refinement = eWeapon.refinement
        const oldType = charTC.artifact.substats.type
        charTC.artifact = initCharTC('DullBlade').artifact
        charTC.artifact.substats.type = oldType
        const sets = {}
        build.forEach((art) => {
          if (!art) return
          const { slotKey, setKey, substats, mainStatKey, level, rarity } = art
          charTC.artifact.slots[slotKey].level = level
          charTC.artifact.slots[slotKey].statKey = mainStatKey
          charTC.artifact.slots[slotKey].rarity = rarity
          sets[setKey] = (sets[setKey] ?? 0) + 1
          substats.forEach((substat) => {
            if (substat.key)
              charTC.artifact.substats.stats[substat.key] =
                (charTC.artifact.substats.stats[substat.key] ?? 0) +
                substat.accurateValue
          })
        })
        charTC.artifact.sets = Object.fromEntries(
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
      }),
    [setCharTC]
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

  const deferredCharTC = useDeferredValue(charTC)
  const overriderArtData = useMemo(
    () => getArtifactData(deferredCharTC),
    [deferredCharTC]
  )

  const overrideWeapon: ICachedWeapon = useMemo(
    () => getWeaponData(deferredCharTC),
    [deferredCharTC]
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
      new URL('./optimizeTcWorker.ts', import.meta.url),
      {
        type: 'module',
      }
    )

  const [status, setStatus] = useState(initialBuildStatus())
  const solving = status.type === 'active'

  const terminateWorker = useCallback(() => {
    workerRef.current.terminate()
    workerRef.current = null
    setStatus(initialBuildStatus())
  }, [workerRef])

  const { minSubLines, minOtherRolls } = useMemo(
    () => getMinSubAndOtherRolls(charTC),
    [charTC]
  )
  const maxTotalRolls = useMemo(
    () =>
      Object.values(charTC.artifact.slots).reduce(
        (accu, { level, rarity }) =>
          accu + artSubstatRollData[rarity].high + Math.floor(level / 4),
        0
      ),
    [charTC]
  )

  const { scalesWith } = useMemo(() => {
    const { nodes } = optimizeTcGetNodes(teamData, characterKey, charTC)
    const scalesWith = nodes ? getScalesWith(nodes) : new Set<SubstatKey>()
    return {
      nodes,
      scalesWith,
    }
  }, [teamData, characterKey, charTC])

  const optimizeSubstats = (apply: boolean) => {
    /**
     * Recalculating teamdata and nodes because the ones in the UI are using deferred,
     * and can cause issue when people click buttons too fast or loiter in inputs
     */
    const tempTeamData = getTeamDataCalc(
      database,
      characterKey,
      0,
      gender,
      getArtifactData(charTC),
      getWeaponData(charTC)
    )
    const { nodes } = optimizeTcGetNodes(tempTeamData, characterKey, charTC)
    workerRef.current.postMessage({ charTC, nodes })
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
                  <ArtifactSubCard
                    disabled={solving}
                    maxTotalRolls={maxTotalRolls}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box display="flex" flexDirection="column" gap={1}>
              {minOtherRolls > 0 && (
                <Alert severity="warning" variant="filled">
                  <Trans
                    t={t}
                    i18nKey="tabTheorycraft.feasibilityAlert"
                    values={{ minSubLines, minOtherRolls }}
                  >
                    The current substat distribution requires at least{' '}
                    <strong>{{ minSubLines } as any}</strong> lines of substats.
                    Need to assign <strong>{{ minOtherRolls } as any}</strong>{' '}
                    rolls to other substats for this solution to be feasible.
                  </Trans>
                </Alert>
              )}
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
                    disabled={
                      !optimizationTarget ||
                      !distributedSubstats ||
                      distributedSubstats > maxTotalRolls
                    }
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
              {!!scalesWith.size && (
                <Alert severity="info" variant="filled">
                  <Trans t={t} i18nKey="tabTheorycraft.optAlert.scalesWith">
                    The selected Optimization target and constraints scales
                    with:{' '}
                  </Trans>
                  {[...scalesWith]
                    .map((k) => (
                      <strong key={k}>
                        <StatIcon statKey={k} iconProps={iconInlineProps} />
                        <ArtifactStatWithUnit statKey={k} />
                      </strong>
                    ))
                    .flatMap((value, index, array) => {
                      if (index === array.length - 2)
                        return [value, <span key="and">, and </span>]
                      if (index === array.length - 1) return value
                      return [value, <span key={index}>, </span>]
                    })}
                  <Trans t={t} i18nKey="tabTheorycraft.optAlert.distribute">
                    . The solver will only distribute stats to these substats.
                  </Trans>{' '}
                  {minOtherRolls > 0 && (
                    <Trans t={t} i18nKey="tabTheorycraft.optAlert.feasibilty">
                      There may be additional leftover substats that should be
                      distributed to non-scaling stats to ensure the solution is
                      feasible.
                    </Trans>
                  )}
                </Alert>
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
          <OptimizationTargetContext.Provider value={optimizationTarget}>
            {dataContextValueWithOld ? (
              <DataContext.Provider value={dataContextValueWithOld}>
                <StatDisplayComponent />
              </DataContext.Provider>
            ) : (
              <Skeleton variant="rectangular" width="100%" height={500} />
            )}
          </OptimizationTargetContext.Provider>
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
