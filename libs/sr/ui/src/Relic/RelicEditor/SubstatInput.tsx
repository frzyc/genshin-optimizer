import {
  CardThemed,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  DropdownButton,
  SqBadge,
  TextButton,
} from '@genshin-optimizer/common/ui'
import {
  clamp,
  getUnitStr,
  roundStat,
  toPercent,
} from '@genshin-optimizer/common/util'
import type { RelicSubStatKey } from '@genshin-optimizer/sr/consts'
import {
  allRelicSubStatKeys,
  relicSubstatRollData,
} from '@genshin-optimizer/sr/consts'
import type { ICachedRelic } from '@genshin-optimizer/sr/db'
import type { ISubstat } from '@genshin-optimizer/sr/srod'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import {
  getSubstatSummedRolls,
  getSubstatValuesPercent,
} from '@genshin-optimizer/sr/util'
import {
  Box,
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
import { StatDisplay } from '../../Character'

// TODO: validation, roll table, roll values, efficiency, display text, icons, ...
export default function SubstatInput({
  index,
  relic,
  setSubstat,
}: {
  index: number
  relic: ICachedRelic | undefined
  setSubstat: (index: number, substat: ISubstat) => void
}) {
  const { t } = useTranslation('relic')
  const { mainStatKey = '', rarity = 5 } = relic ?? {}
  const {
    key = '',
    value = 0,
    rolls = [],
    efficiency = 0,
  } = relic?.substats[index] ?? {}
  // const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const rollNum = rolls.length

  let error = '',
    rollData: readonly number[] = [],
    allowedRolls = 0

  if (relic) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = relic.rarity
    const { numUpgrades, high } = relicSubstatRollData[rarity]
    const maxRollNum = numUpgrades + high - 3
    allowedRolls = maxRollNum - rollNum
    rollData = key ? getSubstatValuesPercent(key, rarity) : []
  }
  const rollOffset = 7 - rollData.length

  // if (!rollNum && key && value) error = error || t('editor.substat.error.noCalc')
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
    [key, rarity]
  )

  return (
    <CardThemed bgt="light">
      <Box sx={{ display: 'flex' }}>
        <ButtonGroup size="small" sx={{ width: '100%', display: 'flex' }}>
          <DropdownButton
            startIcon={key ? <StatIcon statKey={key} /> : undefined}
            title={
              key ? (
                <StatDisplay statKey={key} showPercent disableIcon />
              ) : (
                t('editor.substat.substatFormat', { value: index + 1 })
              )
            }
            disabled={!relic}
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
            {allRelicSubStatKeys
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
                    <StatDisplay statKey={k} showPercent disableIcon />
                  </ListItemText>
                </MenuItem>
              ))}
          </DropdownButton>
          <CustomNumberInputButtonGroupWrapper
            sx={{ flexBasis: 30, flexGrow: 1 }}
          >
            <CustomNumberInput
              float={getUnitStr(key) === '%'}
              placeholder={t('editor.substat.selectSub')}
              value={
                key
                  ? roundStat(toPercent(value, key), key as RelicSubStatKey)
                  : undefined
              }
              onChange={(v) => {
                let value = (v as number) ?? 0
                if (getUnitStr(key) === '%') {
                  value = value / 100
                }
                setSubstat(index, { key, value })
              }}
              disabled={!key}
              error={!!error}
              sx={{
                px: 1,
              }}
              inputProps={{
                sx: { textAlign: 'right' },
              }}
            />
          </CustomNumberInputButtonGroupWrapper>
          {!!rollData.length && (
            <TextButton>{t('editor.substat.nextRolls')}</TextButton>
          )}
          {/* {rollData.map((v, i) => {
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
          })} */}
        </ButtonGroup>
      </Box>
      <Box px={2}>
        <SliderWrapper
          value={roundStat(toPercent(value, key), key as RelicSubStatKey)}
          marks={marks}
          setValue={(v) => {
            let value = (v as number) ?? 0
            if (getUnitStr(key) === '%') {
              value = value / 100
            }
            setSubstat(index, { key, value })
          }}
          disabled={!key}
        />
      </Box>
      <Box sx={{ px: 1, pb: 1 }}>
        {error ? (
          <SqBadge color="error">{t('ui:error')}</SqBadge>
        ) : (
          <Grid container>
            {/* <Grid item>
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
            </Grid> */}
            <Grid item flexGrow={1}>
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
                    sx={{ ml: 1 }}
                  >
                    {/* {artDisplayValue(val, unit)} */}
                    {val}
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
                  {/* <PercentBadge
                    valid={true}
                    max={rollNum * 100}
                    value={
                      efficiency
                        ? efficiency
                        : (t('editor.substat.noStat') as string)
                    }
                  /> */}
                  {efficiency}
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
      // step={null}
      step={0.1}
      disabled={disabled}
      // marks={marks}
      min={marks[1]?.value ?? 0}
      max={marks[marks.length - 1]?.value ?? 0}
      onChange={(_e, v) => setinnerValue(v as number)}
      onChangeCommitted={(_e, v) => setValue(v as number)}
      valueLabelDisplay="auto"
    />
  )
}
