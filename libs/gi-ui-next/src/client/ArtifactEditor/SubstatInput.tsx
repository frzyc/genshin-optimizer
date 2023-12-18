import type { RarityKey } from '@genshin-optimizer/consts'
import { allSubstatKeys, artSubstatRollData } from '@genshin-optimizer/consts'
import type { Artifact, Substat } from '@genshin-optimizer/gi-frontend-gql'
import { allStats } from '@genshin-optimizer/gi-stats'
import { StatIcon } from '@genshin-optimizer/gi-svgicons'
import type { RollColorKey } from '@genshin-optimizer/gi-ui'
import { PercentBadge } from '@genshin-optimizer/gi-ui'
import type { ArtifactMeta } from '@genshin-optimizer/gi-util'
import {
  artDisplayValue,
  getSubstatSummedRolls,
  getSubstatValuesPercent,
} from '@genshin-optimizer/gi-util'
import {
  CardThemed,
  DropdownButton,
  SqBadge,
  TextButton,
} from '@genshin-optimizer/ui-common'
import { clamp, unit as getUnit } from '@genshin-optimizer/util'
import {
  Box,
  Button,
  ButtonGroup,
  InputBase,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Slider,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ArtifactStatWithUnit } from './ArtifactStatKeyDisplay'

export default function SubstatInput({
  index,
  artifact,
  artifactMeta,
  setSubstat,
}: {
  index: number
  artifact: Partial<Artifact>
  artifactMeta: ArtifactMeta
  setSubstat: (index: number, substat?: Substat) => void
}) {
  const { t } = useTranslation('artifact')
  const { mainStatKey, rarity = 5 as RarityKey } = artifact
  const { rolls = [], efficiency = 0 } = artifactMeta.substats?.[index] ?? {}
  const { key, value = 0 } = artifact?.substats?.[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = getUnit(key ?? ''),
    rollNum = rolls.length

  let error = '',
    rollData: readonly number[] = [],
    allowedRolls = 0

  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = artifact.rarity
    const { numUpgrades, high } = artSubstatRollData[rarity as RarityKey]
    const maxRollNum = numUpgrades + high - 3
    allowedRolls = maxRollNum - rollNum
    rollData = key ? getSubstatValuesPercent(key, rarity as RarityKey) : []
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value) error = error || t`editor.substat.error.noCalc`
  if (allowedRolls < 0)
    error =
      error ||
      t('editor.substat.error.noOverRoll', { value: allowedRolls + rollNum })

  const marks = useMemo(
    () =>
      key
        ? [
            { value: 0 },
            ...getSubstatSummedRolls(rarity as RarityKey, key).map((v) => ({
              value: v,
            })),
          ]
        : [{ value: 0 }],
    [key, rarity]
  )

  return (
    <CardThemed bgt="light">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        <ButtonGroup
          size="small"
          disableElevation
          sx={(theme) => ({
            width: '100%',
            display: 'flex',
            backgroundColor: theme.palette.contentNormal.main,
          })}
        >
          <DropdownButton
            startIcon={key ? <StatIcon statKey={key} /> : undefined}
            title={
              key ? (
                <ArtifactStatWithUnit statKey={key} />
              ) : (
                t('editor.substat.substatFormat', { value: index + 1 })
              )
            }
            disabled={!artifact}
            color={key ? 'success' : 'primary'}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {!!key && (
              <MenuItem
                onClick={() => setSubstat(index)}
              >{t`editor.substat.noSubstat`}</MenuItem>
            )}
            {allSubstatKeys
              .filter((key) => mainStatKey !== key)
              .map((k) => (
                <MenuItem
                  key={k}
                  selected={key === k}
                  disabled={key === k}
                  onClick={() => setSubstat(index, { key: k, value: 0 })}
                >
                  <ListItemIcon>
                    <StatIcon statKey={k} />
                  </ListItemIcon>
                  <ListItemText>
                    <ArtifactStatWithUnit statKey={k} />
                  </ListItemText>
                </MenuItem>
              ))}
          </DropdownButton>
          <InputBase
            sx={{ flexBasis: 30, flexGrow: 1, px: 1 }}
            value={key ? value : ''}
            onChange={(e) =>
              key &&
              setSubstat(index, { key, value: parseFloat(e.target.value) })
            }
            type="number"
            disabled={!key}
            error={!!error}
            inputProps={{
              sx: { textAlign: 'right' },
            }}
          />
          {!!rollData.length && (
            <TextButton>{t`editor.substat.nextRolls`}</TextButton>
          )}
          {!!key &&
            rollData.map((v, i) => {
              let newValue = artDisplayValue(accurateValue + v, unit)
              newValue =
                allStats.art.subRollCorrection[rarity]?.[key]?.[newValue] ??
                newValue
              return (
                <Button
                  key={i}
                  color={`roll${clamp(rollOffset + i, 1, 6)}` as any}
                  disabled={(value && !rollNum) || allowedRolls <= 0}
                  onClick={() =>
                    setSubstat(index, { key, value: parseFloat(newValue) })
                  }
                >
                  {newValue}
                </Button>
              )
            })}
        </ButtonGroup>
        <Box px={2} mb={-1}>
          {!!key && (
            <SliderWrapper
              value={value}
              marks={marks}
              setValue={(v) =>
                setSubstat(index, { key, value: (v as number) ?? 0 })
              }
              disabled={!key}
            />
          )}
        </Box>
        <Box>
          {error ? (
            <SqBadge color="error">{t`ui:error`}</SqBadge>
          ) : (
            <Box display="flex" gap={1}>
              <SqBadge
                color={
                  rollNum === 0
                    ? 'secondary'
                    : (`roll${clamp(rollNum, 1, 6)}` as RollColorKey)
                }
              >
                {rollNum
                  ? t('editor.substat.RollCount', { count: rollNum })
                  : t`editor.substat.noRoll`}
              </SqBadge>
              <Box flexGrow={1} display="flex" gap={1}>
                {!!rolls.length &&
                  [...rolls].sort().map((val, i) => (
                    <Typography
                      component="span"
                      key={`${i}.${val}`}
                      color={`roll${clamp(
                        rollOffset + rollData.indexOf(val),
                        1,
                        6
                      )}.main`}
                    >
                      {artDisplayValue(val, unit)}
                    </Typography>
                  ))}
              </Box>
              <Typography>
                <Trans
                  t={t}
                  i18nKey="editor.substat.eff"
                  color="text.secondary"
                >
                  {'RV: '}
                  <PercentBadge
                    valid={true}
                    max={rollNum}
                    value={
                      efficiency
                        ? efficiency
                        : (t`editor.substat.noStat` as string)
                    }
                  />
                </Trans>
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </CardThemed>
  )
}
function SliderWrapper({
  value,
  setValue,
  marks,
  disabled = false,
}: {
  value: number
  setValue: (v: number) => void
  marks: Array<{ value: number }>
  disabled: boolean
}) {
  const [innerValue, setinnerValue] = useState(value)
  useEffect(() => setinnerValue(value), [value])
  return (
    <Slider
      value={innerValue}
      step={null}
      disabled={disabled}
      marks={marks}
      min={0}
      max={marks[marks.length - 1]?.value ?? 0}
      onChange={(e, v) => setinnerValue(v as number)}
      onChangeCommitted={(e, v) => setValue(v as number)}
      valueLabelDisplay="auto"
    />
  )
}
