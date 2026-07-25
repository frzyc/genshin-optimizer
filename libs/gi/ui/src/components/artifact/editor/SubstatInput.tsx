import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
  TextButton,
} from '@genshin-optimizer/common/ui'
import type { Unit } from '@genshin-optimizer/common/util'
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
  FormControlLabel,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Slider,
  Typography,
} from '@mui/material'
import Checkbox from '@mui/material/Checkbox'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { PercentBadge } from '../../PercentBadge'
import { ArtifactStatWithUnit } from '../ArtifactStatKeyDisplay'
import type { RollColorKey } from '../util'

function getCorrectSubstats(
  artifact: ICachedArtifact | undefined,
  isUnactivatedSubstat: boolean,
  substatIndex: number
) {
  if (
    artifact?.unactivatedSubstats &&
    substatIndex === 3 &&
    isUnactivatedSubstat
  ) {
    return artifact.unactivatedSubstats[0]
  } else {
    return artifact?.substats[substatIndex]
  }
}

export function SubstatInput({
  index,
  artifact,
  setSubstat,
  setInitialSubstatValue,
  onChange,
  isUnactivatedSubstat,
}: {
  index: number
  artifact: ICachedArtifact | undefined
  setSubstat: (
    index: number,
    substat: ISubstat,
    isUnactivatedSubstat: boolean
  ) => void
  setInitialSubstatValue: (index: number, value: number | undefined) => void
  onChange: (index: number, substat: ISubstat, isChecked: boolean) => void
  isUnactivatedSubstat: boolean
}) {
  const { t } = useTranslation('artifact')
  const { mainStatKey = '', rarity = 5, level = 0 } = artifact ?? {}
  const {
    key = '',
    value = 0,
    rolls = [],
    efficiency = 0,
    initialValue,
  } = getCorrectSubstats(artifact, isUnactivatedSubstat, index) ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = getUnitStr(key),
    rollNum = rolls.length

  let error = '',
    allowedRolls = 0

  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = artifact.rarity
    const { numUpgrades, high } = artSubstatRollData[rarity]
    const maxRollNum = numUpgrades + high - 3
    allowedRolls = maxRollNum - rollNum
  }
  const rollData = artifact && key ? getSubstatValuesPercent(key, rarity) : []
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
    [key, rarity]
  )

  const showInitialValue = level === 20 && !!key

  // With exactly one total roll, the substat's value is unambiguously its
  // initial roll, so record it automatically (and don't offer the slider).
  useEffect(() => {
    if (showInitialValue && rollNum === 1 && initialValue === undefined)
      setInitialSubstatValue(index, value)
  }, [
    showInitialValue,
    rollNum,
    initialValue,
    value,
    index,
    setInitialSubstatValue,
  ])

  const initialRollValues = useMemo(() => {
    if (!(showInitialValue && rollNum > 1) || !rollData.length) return []
    const minRoll = Math.min(...rollData)
    const maxRoll = Math.max(...rollData)
    const remainingRolls = rollNum - 1
    const eps = 1e-6
    return rollData
      .filter((v) => {
        const remaining = accurateValue - v
        return (
          remaining >= remainingRolls * minRoll - eps &&
          remaining <= remainingRolls * maxRoll + eps
        )
      })
      .map((v) => Number.parseFloat(artDisplayValue(v, unit)))
  }, [showInitialValue, rollNum, rollData, accurateValue, unit])

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
                onClick={() =>
                  setSubstat(index, { key: '', value: 0 }, isUnactivatedSubstat)
                }
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
                  onClick={() =>
                    setSubstat(
                      index,
                      { key: k, value: 0 },
                      isUnactivatedSubstat
                    )
                  }
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
            onChange={(value) =>
              setSubstat(
                index,
                { key, value: value ?? 0 },
                isUnactivatedSubstat
              )
            }
            disabled={!key || (isUnactivatedSubstat && index === 3)}
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
                disabled={
                  (value && !rollNum) ||
                  allowedRolls <= 0 ||
                  (isUnactivatedSubstat && rollNum > 0 && index === 3)
                }
                onClick={() =>
                  setSubstat(
                    index,
                    { key, value: Number.parseFloat(newValue) },
                    isUnactivatedSubstat
                  )
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
            setSubstat(
              index,
              { key, value: (v as number) ?? 0 },
              isUnactivatedSubstat
            )
          }
          disabled={!key || (isUnactivatedSubstat && index === 3)}
          initialRollValues={initialRollValues}
          initialValue={initialValue}
          unit={unit}
          setInitialValue={(v) => setInitialSubstatValue(index, v)}
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
            <Grid item>
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
                    {artDisplayValue(val, unit)}
                  </Typography>
                ))}
            </Grid>
            <Grid item flexGrow={1}>
              {index === 3 ? (
                <FormControlLabel
                  label={t('editor.unactivated')}
                  control={
                    <Checkbox
                      checked={isUnactivatedSubstat}
                      onChange={(e) =>
                        onChange(
                          index,
                          { key: key, value: value },
                          e.target.checked
                        )
                      }
                      sx={{ padding: 0 }}
                      disabled={!artifact || level > 0}
                    />
                  }
                  sx={{ ml: 1 }}
                />
              ) : (
                ''
              )}
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
  initialRollValues = [],
  initialValue,
  unit,
  setInitialValue,
}: {
  value: number
  setValue: (v: number) => void
  marks: Array<{ value: number }>
  disabled: boolean
  initialRollValues?: number[]
  initialValue?: number
  unit?: Unit
  setInitialValue?: (v: number | undefined) => void
}) {
  const [innerValue, setinnerValue] = useState(value)
  useEffect(() => setinnerValue(value), [value])
  const max = marks[marks.length - 1]?.value ?? 0
  return (
    <Box sx={{ position: 'relative' }}>
      <Slider
        value={innerValue}
        step={null}
        disabled={disabled}
        marks={marks}
        min={0}
        max={max}
        onChange={(_e, v) => setinnerValue(v as number)}
        onChangeCommitted={(_e, v) => setValue(v as number)}
        valueLabelDisplay="auto"
      />
      {!disabled && !!initialRollValues.length && max > 0 && (
        <InitialValueSlider
          initialRollValues={initialRollValues}
          initialValue={initialValue}
          unit={unit}
          max={max}
          setInitialValue={setInitialValue}
        />
      )}
    </Box>
  )
}

// An invisible slider layered on top of the substat slider. Only its thumb is
// shown, so the user can drag it to the first-roll dots to record/save the
// substat's `initialValue`. When no initial value is set the thumb is parked
// (grayed) at the minimum; dragging it back there clears the value again.
function InitialValueSlider({
  initialRollValues,
  initialValue,
  unit,
  max,
  setInitialValue,
}: {
  initialRollValues: number[]
  initialValue?: number
  unit?: Unit
  max: number
  setInitialValue?: (v: number | undefined) => void
}) {
  const { t } = useTranslation('artifact')
  const marks = useMemo(
    () => [{ value: 0 }, ...initialRollValues.map((v) => ({ value: v }))],
    [initialRollValues]
  )
  const defined = initialValue !== undefined
  const [innerValue, setInnerValue] = useState(initialValue ?? 0)
  useEffect(() => setInnerValue(initialValue ?? 0), [initialValue])
  return (
    <Slider
      value={innerValue}
      step={null}
      marks={marks}
      min={0}
      max={max}
      aria-label={t('editor.substat.initialRoll')}
      valueLabelDisplay="auto"
      valueLabelFormat={(v) => (v ? artDisplayValue(v, unit ?? '') : '—')}
      onChange={(_e, v) => setInnerValue(v as number)}
      onChangeCommitted={(_e, v) =>
        setInitialValue?.((v as number) === 0 ? undefined : (v as number))
      }
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        // Let clicks fall through to the substat slider underneath; only the
        // thumb itself stays interactive.
        pointerEvents: 'none',
        '& .MuiSlider-rail, & .MuiSlider-track, & .MuiSlider-mark': {
          display: 'none',
        },
        // Small diamond thumb. The diamond is drawn on a rotated ::before so it
        // can carry a real outline (a border on a clip-path'd thumb would be
        // clipped away), while the thumb keeps its centering transform.
        '& .MuiSlider-thumb': {
          pointerEvents: 'auto',
          width: 12,
          height: 12,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: 'none' },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 9,
            height: 9,
            // Reset the thumb's inherited 50% radius, otherwise the rotated
            // square renders as a circle.
            borderRadius: 0,
            transform: 'translate(-50%, -50%) rotate(45deg)',
            boxShadow: 'none',
            border: '1px solid',
            borderColor: (theme) => theme.palette.common.black,
            backgroundColor: (theme) =>
              defined ? theme.palette.primary.main : theme.palette.grey[500],
          },
        },
      }}
    />
  )
}
