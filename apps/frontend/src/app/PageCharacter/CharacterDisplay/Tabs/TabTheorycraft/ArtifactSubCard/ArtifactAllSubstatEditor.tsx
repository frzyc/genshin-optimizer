import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { objMap } from '@genshin-optimizer/util'
import { Box, Slider } from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import CardDark from '../../../../../Components/Card/CardDark'
import CustomNumberInput from '../../../../../Components/CustomNumberInput'
import type { ICharTC } from '../../../../../Types/character'
import { CharTCContext } from '../CharTCContext'

const DEFAULT_MAX_ROLLS = 30

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
export function ArtifactAllSubstatEditor() {
  const { charTC, setCharTC } = useContext(CharTCContext)
  const [rolls, setRolls] = useState(() => getMinRoll(charTC))
  const [maxSubstat, setMaxSubstat] = useState(() => getMinMax(charTC))

  const rollsDeferred = useDeferredValue(rolls)
  useEffect(() => {
    if (rollsDeferred === undefined) return
    setCharTC((charTC) => {
      const {
        artifact: {
          substats: { stats, type, rarity },
        },
      } = charTC
      charTC.artifact.substats.stats = objMap(stats, (val, statKey) => {
        const substatValue = getSubstatValue(statKey, rarity, type)
        return substatValue * rollsDeferred
      })
    })
  }, [setCharTC, rollsDeferred])

  const maxSubstatDeferred = useDeferredValue(maxSubstat)
  useEffect(() => {
    if (maxSubstatDeferred === undefined) return
    setCharTC((charTC) => {
      charTC.optimization.maxSubstats = objMap(
        charTC.optimization.maxSubstats,
        (_val, _statKey) => maxSubstatDeferred
      )
    })
  }, [setCharTC, maxSubstatDeferred])

  // 0.0001 to nudge float comparasion
  const invalid = (rolls ?? 0 - 0.0001) > DEFAULT_MAX_ROLLS

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
          max={DEFAULT_MAX_ROLLS}
          min={0}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={(e, v) => setRolls(v as number)}
          onChangeCommitted={(e, v) => setRolls(v as number)}
        />
      </CardDark>
      <CustomNumberInput
        color={rolls ? (invalid ? 'warning' : 'success') : 'primary'}
        float
        startAdornment={<Box sx={{ whiteSpace: 'nowrap' }}>All Rolls</Box>}
        value={parseFloat((rolls ?? 0).toFixed(2))}
        onChange={(v) => v !== undefined && setRolls(v)}
        sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '7em' }}
        inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
      />
      <CustomNumberInput
        value={maxSubstat ?? 0}
        startAdornment={<Box sx={{ whiteSpace: 'nowrap' }}>All Max</Box>}
        onChange={(v) => v !== undefined && setMaxSubstat(v)}
        color={(maxSubstat ?? 0) > DEFAULT_MAX_ROLLS ? 'warning' : 'success'}
        sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '6.5em' }}
        inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
      />
    </Box>
  )
}
