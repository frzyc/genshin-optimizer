import {
  CardThemed,
  CustomNumberInput,
  useIsMount,
} from '@genshin-optimizer/common/ui'
import { clamp, objMap } from '@genshin-optimizer/common/util'
import { artSubstatRollData } from '@genshin-optimizer/gi/consts'
import type { BuildTc } from '@genshin-optimizer/gi/db'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import { Box, Slider } from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildTcContext } from '../BuildTcContext'

function getMinRoll(charTC: BuildTc) {
  const {
    artifact: {
      substats: { stats, rarity, type },
    },
  } = charTC
  return Math.floor(
    Math.min(
      ...Object.entries(stats).map(
        ([k, v]) => v / getSubstatValue(k, rarity, type)
      )
    )
  )
}
function getMinMax(buildTc: BuildTc) {
  return Math.floor(
    Math.min(...Object.values(buildTc.optimization.maxSubstats))
  )
}
export function ArtifactAllSubstatEditor({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character')
  const { buildTc, setBuildTc } = useContext(BuildTcContext)
  // Encapsulate the values in an array so that changes to the same number still trigger useEffects
  const [rollsData, setRolls] = useState(() => [getMinRoll(buildTc)])
  const [maxSubstatData, setMaxSubstat] = useState(() => [getMinMax(buildTc)])
  const [rolls] = rollsData
  const [maxSubstat] = maxSubstatData
  const rollsDeferred = useDeferredValue(rollsData)
  const isMount = useIsMount()
  useEffect(() => {
    if (isMount) return
    setBuildTc((buildTc) => {
      const {
        artifact: {
          substats: { stats, type, rarity },
        },
      } = buildTc
      buildTc.artifact.substats.stats = objMap(stats, (val, statKey) => {
        const old = val
        const substatValue = getSubstatValue(statKey, rarity, type)
        const newVal = substatValue * rollsDeferred[0]

        const statDiff = Math.round(old / substatValue - rollsDeferred[0])
        buildTc.optimization.distributedSubstats = clamp(
          buildTc.optimization.distributedSubstats + statDiff,
          0,
          45
        )
        return newVal
      })
    })
    // disable triggering for isMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollsDeferred])

  const maxSubstatDeferred = useDeferredValue(maxSubstatData)
  useEffect(() => {
    if (isMount) return
    setBuildTc((charTC) => {
      charTC.optimization.maxSubstats = objMap(
        charTC.optimization.maxSubstats,
        (_val, _statKey) => maxSubstatDeferred[0]
      )
    })
    // disable triggering for isMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSubstatDeferred])

  const maxRollsPerSub =
    (artSubstatRollData[buildTc.artifact.substats.rarity].numUpgrades + 1) * 5
  // 0.0001 to nudge float comparasion
  const invalid = (rolls ?? 0 - 0.0001) > maxRollsPerSub

  return (
    <Box
      display="flex"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <CardThemed
        sx={{
          px: 2,
          flexGrow: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}
      >
        <Slider
          size="small"
          value={rolls ?? 0}
          max={maxRollsPerSub}
          min={0}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={(e, v) => setRolls([v as number])}
          onChangeCommitted={(e, v) => setRolls([v as number])}
          disabled={disabled}
        />
      </CardThemed>
      <CustomNumberInput
        color={rolls && invalid ? 'warning' : 'primary'}
        float
        startAdornment={
          <Box sx={{ whiteSpace: 'nowrap' }}>{t`tabTheorycraft.all.rolls`}</Box>
        }
        value={parseFloat((rolls ?? 0).toFixed(2))}
        onChange={(v) => v !== undefined && setRolls([v])}
        sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '7em' }}
        inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
        disabled={disabled}
      />
      <CustomNumberInput
        value={maxSubstat ?? 0}
        startAdornment={
          <Box sx={{ whiteSpace: 'nowrap' }}>{t`tabTheorycraft.all.max`}</Box>
        }
        onChange={(v) => v !== undefined && setMaxSubstat([v])}
        color={(maxSubstat ?? 0) > maxRollsPerSub ? 'warning' : 'primary'}
        sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '6.5em' }}
        inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
        disabled={disabled}
      />
    </Box>
  )
}
