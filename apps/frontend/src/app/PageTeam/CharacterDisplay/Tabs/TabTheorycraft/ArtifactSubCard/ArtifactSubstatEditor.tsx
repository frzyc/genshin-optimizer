import {
  BootstrapTooltip,
  CardThemed,
  ColorText,
} from '@genshin-optimizer/common/ui'
import { clamp } from '@genshin-optimizer/common/util'
import { artMaxLevel, type SubstatKey } from '@genshin-optimizer/gi/consts'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { artDisplayValue, getSubstatValue } from '@genshin-optimizer/gi/util'
import InfoIcon from '@mui/icons-material/Info'
import { Box, Slider, Stack, Typography } from '@mui/material'
import { useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomNumberInput from '../../../../../Components/CustomNumberInput'
import StatIcon from '../../../../../KeyMap/StatIcon'
import { CharTCContext } from '../CharTCContext'
export function ArtifactSubstatEditor({
  statKey,
  disabled = false,
}: {
  statKey: SubstatKey
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character')
  const {
    charTC: {
      artifact: {
        slots,
        substats: { type: substatsType, stats: substats, rarity },
      },
      optimization: { maxSubstats },
    },
    setCharTC,
  } = useContext(CharTCContext)
  const mainStatKeys = Object.values(slots).map((s) => s.statKey)
  const value = substats[statKey]
  const setValue = useCallback(
    (v: number) => {
      setCharTC((charTC) => {
        const old = charTC.artifact.substats.stats[statKey]
        charTC.artifact.substats.stats[statKey] = v
        const statDiff = Math.round(
          (old - v) /
            getSubstatValue(
              statKey,
              charTC.artifact.substats.rarity,
              charTC.artifact.substats.type
            )
        )
        charTC.optimization.distributedSubstats = clamp(
          charTC.optimization.distributedSubstats + statDiff,
          0,
          45
        )
      })
    },
    [setCharTC, statKey]
  )
  const maxSubstat = maxSubstats[statKey]
  const setMaxSubstat = useCallback(
    (v: number) => {
      setCharTC((charTC) => {
        charTC.optimization.maxSubstats[statKey] = v
      })
    },
    [setCharTC, statKey]
  )
  // const { t } = useTranslation('page_character')
  const substatValue = getSubstatValue(statKey, rarity, substatsType)
  const [rolls, setRolls] = useState(() => value / substatValue)
  useEffect(() => setRolls(value / substatValue), [value, substatValue])

  const unit = KeyMap.unit(statKey)
  const displayValue = rolls * substatValue

  const rv = ((rolls * substatValue) / getSubstatValue(statKey)) * 100
  const numMains = mainStatKeys.reduce(
    (t, ms) => t + (ms === statKey ? 1 : 0),
    0
  )
  const maxRolls = (5 - numMains) * (artMaxLevel[rarity] / 4 + 1)
  // 0.0001 to nudge float comparasion
  const invalid = rolls - 0.0001 > maxRolls
  const setRValue = useCallback(
    (r: number) => setValue(r * substatValue),
    [setValue, substatValue]
  )

  return (
    <Stack spacing={0.5}>
      <Box
        display="flex"
        gap={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomNumberInput
          color={displayValue ? 'success' : 'primary'}
          float={KeyMap.unit(statKey) === '%'}
          endAdornment={
            KeyMap.unit(statKey) || <Box width="1em" component="span" />
          }
          value={parseFloat(displayValue.toFixed(2))}
          onChange={(v) => v !== undefined && setValue(v)}
          sx={{ borderRadius: 1, px: 1, height: '100%', width: '5em' }}
          inputProps={{ sx: { textAlign: 'right' }, min: 0 }}
          disabled={disabled}
        />
        <CardThemed
          sx={{
            p: 0.5,
            minWidth: '11em',
            flexGrow: 1,
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StatIcon statKey={statKey} iconProps={{ fontSize: 'inherit' }} />
          {KeyMap.getStr(statKey)}
          {KeyMap.unit(statKey)}
        </CardThemed>
        <CustomNumberInput
          color={value ? (invalid ? 'warning' : 'success') : 'primary'}
          float
          startAdornment={
            <Box
              sx={{
                whiteSpace: 'nowrap',
                width: '6em',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {artDisplayValue(substatValue, unit)}
                {unit}
              </span>
              <span>x</span>
            </Box>
          }
          value={parseFloat(rolls.toFixed(2))}
          onChange={(v) => v !== undefined && setValue(v * substatValue)}
          sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '6.5em' }}
          inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
          disabled={disabled}
        />
        <CardThemed sx={{ textAlign: 'center', p: 0.5, minWidth: '6em' }}>
          <ColorText color={invalid ? 'warning' : undefined}>
            RV: <strong>{rv.toFixed()}%</strong>
            <BootstrapTooltip
              title={
                <Typography>
                  {t(
                    numMains
                      ? `tabTheorycraft.maxRollsMain`
                      : `tabTheorycraft.maxRolls`,
                    { value: maxRolls }
                  )}
                </Typography>
              }
              placement="top"
            >
              <InfoIcon fontSize="inherit" sx={{ verticalAlign: '-10%' }} />
            </BootstrapTooltip>
          </ColorText>
        </CardThemed>
      </Box>
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
            value={rolls}
            max={Math.min(maxRolls, maxSubstat)}
            min={0}
            step={1}
            marks
            valueLabelDisplay="auto"
            onChange={(e, v) => setRolls(v as number)}
            onChangeCommitted={(e, v) => setRValue(v as number)}
            disabled={disabled}
          />
        </CardThemed>

        <CustomNumberInput
          value={maxSubstat}
          startAdornment={t`tabTheorycraft.substat.max`}
          onChange={(v) => v !== undefined && setMaxSubstat(v)}
          color={
            // 0.0001 to nudge float comparasion
            rolls - 0.0001 > maxSubstat
              ? 'error'
              : maxSubstat > maxRolls
              ? 'warning'
              : 'success'
          }
          sx={{ borderRadius: 1, px: 1, my: 0, height: '100%', width: '6em' }}
          inputProps={{ sx: { textAlign: 'right', pr: 0.5 }, min: 0, step: 1 }}
          disabled={disabled}
        />
      </Box>
    </Stack>
  )
}
