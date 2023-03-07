import { Box, Button, ButtonGroup, Grid, ListItemIcon, ListItemText, MenuItem, Slider, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ArtifactStatWithUnit } from '../../../Components/Artifact/ArtifactStatKeyDisplay';
import CardLight from '../../../Components/Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../../../Components/CustomNumberInput';
import DropdownButton from '../../../Components/DropdownMenu/DropdownButton';
import PercentBadge from '../../../Components/PercentBadge';
import SqBadge from '../../../Components/SqBadge';
import TextButton from '../../../Components/TextButton';
import Artifact, { artifactSubRolls } from '../../../Data/Artifacts/Artifact';
import artifactSubstatRollCorrection from '../../../Data/Artifacts/artifact_sub_rolls_correction_gen.json';
import KeyMap, { cacheValueString } from '../../../KeyMap';
import StatIcon from '../../../KeyMap/StatIcon';
import { allSubstatKeys, ICachedArtifact, ISubstat } from '../../../Types/artifact';
import { RollColorKey } from '../../../Types/consts';
import { clamp } from '../../../Util/Util';

export default function SubstatInput({ index, artifact, setSubstat }: { index: number, artifact: ICachedArtifact | undefined, setSubstat: (index: number, substat: ISubstat) => void, }) {
  const { t } = useTranslation("artifact")
  const { mainStatKey = "", rarity = 5 } = artifact ?? {}
  const { key = "", value = 0, rolls = [], efficiency = 0 } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = KeyMap.unit(key), rollNum = rolls.length

  let error = "", rollData: readonly number[] = [], allowedRolls = 0

  if (artifact) {
    // Account for the rolls it will need to fill all 4 substates, +1 for its base roll
    const rarity = artifact.rarity
    const { numUpgrades, high } = Artifact.rollInfo(rarity)
    const maxRollNum = numUpgrades + high - 3;
    allowedRolls = maxRollNum - rollNum
    rollData = key ? Artifact.getSubstatRollData(key, rarity) : []
  }
  const rollOffset = 7 - rollData.length

  if (!rollNum && key && value) error = error || t`editor.substat.error.noCalc`
  if (allowedRolls < 0) error = error || t("editor.substat.error.noOverRoll", { value: allowedRolls + rollNum })

  const marks = useMemo(() => key ? [{ value: 0 }, ...artifactSubRolls(rarity, key).map(v => ({ value: v, }))] : [{ value: 0 }], [key, rarity])

  return <CardLight>
    <Box sx={{ display: "flex" }}>
      <ButtonGroup size="small" sx={{ width: "100%", display: "flex" }}>
        <DropdownButton
          startIcon={key ? <StatIcon statKey={key} /> : undefined}
          title={key ? <ArtifactStatWithUnit statKey={key} /> : t('editor.substat.substatFormat', { value: index + 1 })}
          disabled={!artifact}
          color={key ? "success" : "primary"}
          sx={{ whiteSpace: "nowrap" }}>
          {key && <MenuItem onClick={() => setSubstat(index, { key: "", value: 0 })}>{t`editor.substat.noSubstat`}</MenuItem>}
          {allSubstatKeys.filter(key => mainStatKey !== key)
            .map(k => <MenuItem key={k} selected={key === k} disabled={key === k} onClick={() => setSubstat(index, { key: k, value: 0 })} >
              <ListItemIcon><StatIcon statKey={k} /></ListItemIcon>
              <ListItemText><ArtifactStatWithUnit statKey={k} /></ListItemText>
            </MenuItem>)}
        </DropdownButton>
        <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }} >
          <CustomNumberInput
            float={unit === "%"}
            placeholder={t`editor.substat.selectSub`}
            value={key ? value : undefined}
            onChange={value => setSubstat(index, { key, value: value ?? 0 })}
            disabled={!key}
            error={!!error}
            sx={{
              px: 1,
            }}
            inputProps={{
              sx: { textAlign: "right" }
            }}
          />
        </CustomNumberInputButtonGroupWrapper>
        {!!rollData.length && <TextButton>{t`editor.substat.nextRolls`}</TextButton>}
        {rollData.map((v, i) => {
          let newValue = cacheValueString(accurateValue + v, unit)
          newValue = artifactSubstatRollCorrection[rarity]?.[key]?.[newValue] ?? newValue
          return <Button key={i} color={`roll${clamp(rollOffset + i, 1, 6)}` as any} disabled={(value && !rollNum) || allowedRolls <= 0} onClick={() => setSubstat(index, { key, value: parseFloat(newValue) })}>{newValue}</Button>
        })}
      </ButtonGroup>
    </Box>
    <Box px={2}>
      <SliderWrapper value={value} marks={marks} setValue={v => setSubstat(index, { key, value: (v as number) ?? 0 })} disabled={!key} />
    </Box>
    <Box sx={{ px: 1, pb: 1 }}>
      {error ? <SqBadge color="error">{t`ui:error`}</SqBadge> : <Grid container>
        <Grid item>
          <SqBadge color={rollNum === 0 ? "secondary" : `roll${clamp(rollNum, 1, 6)}` as RollColorKey}>
            {rollNum ? t("editor.substat.RollCount", { count: rollNum }) : t`editor.substat.noRoll`}
          </SqBadge>
        </Grid>
        <Grid item flexGrow={1}>
          {!!rolls.length && [...rolls].sort().map((val, i) =>
            <Typography component="span" key={`${i}.${val}`} color={`roll${clamp(rollOffset + rollData.indexOf(val), 1, 6)}.main`} sx={{ ml: 1 }} >{cacheValueString(val, unit)}</Typography>)}
        </Grid>
        <Grid item xs="auto" flexShrink={1}>
          <Typography>
            <Trans t={t} i18nKey="editor.substat.eff" color="text.secondary">
              Efficiency: <PercentBadge valid={true} max={rollNum * 100} value={efficiency ? efficiency : t`editor.substat.noStat` as string} />
            </Trans>
          </Typography>
        </Grid>
      </Grid>}

    </Box>
  </CardLight >
}
function SliderWrapper({ value, setValue, marks, disabled = false }:
  { value: number, setValue: (v: number) => void, marks: Array<{ value: number }>, disabled: boolean }) {
  const [innerValue, setinnerValue] = useState(value)
  useEffect(() => setinnerValue(value), [value])
  return <Slider
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
}
