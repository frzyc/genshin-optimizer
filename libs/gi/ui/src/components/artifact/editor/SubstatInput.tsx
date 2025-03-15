import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
  TextButton,
} from '@genshin-optimizer/common/ui'
import { clamp, getUnitStr } from '@genshin-optimizer/common/util'
import {
  allSubstatKeys,
  artSubstatRollData,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { ISubstat } from '@genshin-optimizer/gi/good'
import { allStats } from '@genshin-optimizer/gi/stats'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import {
  artDisplayValue,
  getSubstatSummedRolls,
  getSubstatValuesPercent,
} from '@genshin-optimizer/gi/util'
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Slider,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PercentBadge } from '../../PercentBadge'
import { ArtifactStatWithUnit } from '../ArtifactStatKeyDisplay'
import type { RollColorKey } from '../util'
export function SubstatInput({
  index,
  artifact,
  setSubstat,
}: {
  index: number
  artifact: ICachedArtifact | undefined
  setSubstat: (index: number, substat: ISubstat) => void
}) {
  const { t } = useTranslation('artifact')
  const { mainStatKey = '', rarity = 5 } = artifact ?? {}
  const {
    key = '',
    value = 0,
    rolls = [],
    efficiency = 0,
  } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = getUnitStr(key),
    rollNum = rolls.length

  let error = '',
    rollData: readonly number[] = [],
    allowedRolls = 0

  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = artifact.rarity
    const { numUpgrades, high } = artSubstatRollData[rarity]
    const maxRollNum = numUpgrades + high - 3
    allowedRolls = maxRollNum - rollNum
    rollData = key ? getSubstatValuesPercent(key, rarity) : []
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value)
    error = error || t('editor.substat.error.noCalc')
  if (allowedRolls < 0)
    error =
      error ||
      t('editor.substat.error.noOverRoll', { value: allowedRolls + rollNum })

  const marks = useMemo(
    () =>
      key
        ? [
            { value: 0 },
            ...getSubstatSummedRolls(rarity, key).map((v) => ({ value: v })),
          ]
        : [{ value: 0 }],
    [key, rarity],
  )

  return (
    <CardThemed bgt="light">
      <Box sx={{ display: 'flex', height: '2.5em' }}>
        <ButtonGroup size="small" sx={{ width: '100%', display: 'flex' }}>
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
            {key && (
              <MenuItem
                onClick={() => setSubstat(index, { key: '', value: 0 })}
              >
                {t('editor.substat.noSubstat')}
              </MenuItem>
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
          <NumberInputLazy
            sx={{
              flexBasis: 30,
              flexGrow: 1,
              padding: 0,
              div: {
                width: '100%',
                height: '100%',
              },
            }}
            float={unit === '%'}
            placeholder={t('editor.substat.selectSub')}
            value={key ? value : 0}
            onChange={(value) => setSubstat(index, { key, value: value ?? 0 })}
            disabled={!key}
            error={!!error}
            inputProps={{
              sx: { textAlign: 'right' },
            }}
          />
          {!!rollData.length && (
            <TextButton>{t('editor.substat.nextRolls')}</TextButton>
          )}
          {rollData.map((v, i) => {
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
      </Box>
      <Box px={2}>
        <SliderWrapper
          value={value}
          marks={marks}
          setValue={(v) =>
            setSubstat(index, { key, value: (v as number) ?? 0 })
          }
          disabled={!key}
        />
      </Box>
      <Box sx={{ px: 1, pb: 1 }}>
        {error ? (
          <SqBadge color="error">{t('ui:error')}</SqBadge>
        ) : (
          <Grid container>
            <Grid item>
              <SqBadge
                color={
                  rollNum === 0
                    ? 'secondary'
                    : (`roll${clamp(rollNum, 1, 6)}` as RollColorKey)
                }
              >
                {rollNum
                  ? t('editor.substat.RollCount', { count: rollNum })
                  : t('editor.substat.noRoll')}
              </SqBadge>
            </Grid>
            <Grid item flexGrow={1}>
              {!!rolls.length &&
                [...rolls].sort().map((val, i) => (
                  <Typography
                    component="span"
                    key={`${i}.${val}`}
                    color={`roll${clamp(
                      rollOffset + rollData.indexOf(val),
                      1,
                      6,
                    )}.main`}
                    sx={{ ml: 1 }}
                  >
                    {artDisplayValue(val, unit)}
                  </Typography>
                ))}
            </Grid>
            <Grid item xs="auto" flexShrink={1}>
              <Typography>
                <Trans
                  t={t}
                  i18nKey="editor.substat.eff"
                  color="text.secondary"
                >
                  {'Efficiency: '}
                  <PercentBadge
                    valid={true}
                    max={rollNum}
                    value={
                      efficiency
                        ? efficiency
                        : (t('editor.substat.noStat') as string)
                    }
                  />
                </Trans>
              </Typography>
            </Grid>
          </Grid>
        )}
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
