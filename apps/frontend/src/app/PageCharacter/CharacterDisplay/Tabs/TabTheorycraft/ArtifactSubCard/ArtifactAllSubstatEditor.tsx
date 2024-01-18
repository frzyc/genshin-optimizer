import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { objMap } from '@genshin-optimizer/util'
import { Box, Slider } from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import CardDark from '../../../../../Components/Card/CardDark'
import CustomNumberInput from '../../../../../Components/CustomNumberInput'
import type { ICharTC } from '../../../../../Types/character'
import { CharTCContext } from '../CharTCContext'
import { artSubstatRollData } from '@genshin-optimizer/consts'
import { useIsMount } from '@genshin-optimizer/ui-common'
import { useTranslation } from 'react-i18next'

function getMinRoll(charTC: ICharTC) {
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
function getMinMax(charTC: ICharTC) {
  return Math.floor(Math.min(...Object.values(charTC.optimization.maxSubstats)))
}
export function ArtifactAllSubstatEditor({
  disabled = false,
}: {
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character')
  const { charTC, setCharTC } = useContext(CharTCContext)
  // Encapsulate the values in an array so that changes to the same number still trigger useEffects
  const [rollsData, setRolls] = useState(() => [getMinRoll(charTC)])
  const [maxSubstatData, setMaxSubstat] = useState(() => [getMinMax(charTC)])
  const [rolls] = rollsData
  const [maxSubstat] = maxSubstatData
  const rollsDeferred = useDeferredValue(rollsData)
  const isMount = useIsMount()
  useEffect(() => {
    if (isMount) return
    setCharTC((charTC) => {
      const {
        artifact: {
          substats: { stats, type, rarity },
        },
      } = charTC
      charTC.artifact.substats.stats = objMap(stats, (val, statKey) => {
        const substatValue = getSubstatValue(statKey, rarity, type)
        return substatValue * rollsDeferred[0]
      })
    })
    // disable triggering for isMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCharTC, rollsDeferred])

  const maxSubstatDeferred = useDeferredValue(maxSubstatData)
  useEffect(() => {
    if (isMount) return
    setCharTC((charTC) => {
      charTC.optimization.maxSubstats = objMap(
        charTC.optimization.maxSubstats,
        (_val, _statKey) => maxSubstatDeferred[0]
      )
    })
    // disable triggering for isMount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCharTC, maxSubstatDeferred])

  const maxRolls =
    (artSubstatRollData[charTC.artifact.substats.rarity].numUpgrades + 1) * 5
  // 0.0001 to nudge float comparasion
  const invalid = (rolls ?? 0 - 0.0001) > maxRolls

  return (
    <Box
      display="flex"
      gap={1}
      justifyContent="space-between"
      alignItems="center"
    >
      <CardDark
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
          max={maxRolls}
          min={0}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={(e, v) => setRolls([v as number])}
          onChangeCommitted={(e, v) => setRolls([v as number])}
          disabled={disabled}
        />
      </CardDark>
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
        color={(maxSubstat ?? 0) > maxRolls ? 'warning' : 'primary'}
        sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '6.5em' }}
        inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
        disabled={disabled}
      />
    </Box>
  )
}
