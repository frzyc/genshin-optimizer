import { Box, Button, ButtonGroup, Grid, MenuItem, Typography } from '@mui/material';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CardLight from '../../../Components/Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../../../Components/CustomNumberInput';
import DropdownButton from '../../../Components/DropdownMenu/DropdownButton';
import SqBadge from '../../../Components/SqBadge';
import TextButton from '../../../Components/TextButton';
import { allSubstats, ICachedArtifact, ISubstat } from '../../../Types/artifact';
import { clamp } from '../../../Util/Util';
import Artifact from '../../../Data/Artifacts/Artifact';
import artifactSubstatRollCorrection from '../../../Data/Artifacts/artifact_sub_rolls_correction_gen.json';
import PercentBadge from '../../PercentBadge';
import KeyMap, { valueString } from '../../../KeyMap';
export default function SubstatInput({ index, artifact, setSubstat }: { index: number, artifact: ICachedArtifact | undefined, setSubstat: (index: number, substat: ISubstat) => void, }) {
  const { t } = useTranslation("artifact")
  const { mainStatKey = "", rarity = 5 } = artifact ?? {}
  const { key = "", value = 0, rolls = [], efficiency = 0 } = artifact?.substats[index] ?? {}

  const accurateValue = rolls.reduce((a, b) => a + b, 0)
  const unit = KeyMap.unit(key), rollNum = rolls.length

  let error: string = "", rollData: readonly number[] = [], allowedRolls = 0

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

  return <CardLight>
    <Box sx={{ display: "flex" }}>
      <ButtonGroup size="small" sx={{ width: "100%", display: "flex" }}>
        <DropdownButton title={key ? KeyMap.get(key) : t('editor.substat.substatFormat', { value: index + 1 })} disabled={!artifact} color={key ? "success" : "primary"} sx={{ whiteSpace: "nowrap" }}>
          {key && <MenuItem onClick={() => setSubstat(index, { key: "", value: 0 })}>{t`editor.substat.noSubstat`}</MenuItem>}
          {allSubstats.filter(key => mainStatKey !== key)
            .map(k => <MenuItem key={k} selected={key === k} disabled={key === k} onClick={() => setSubstat(index, { key: k, value: 0 })} >
              {KeyMap.get(k)}
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
          let newValue = valueString(accurateValue + v, unit)
          newValue = artifactSubstatRollCorrection[rarity]?.[key]?.[newValue] ?? newValue
          return <Button key={i} color={`roll${clamp(rollOffset + i, 1, 6)}` as any} disabled={(value && !rollNum) || allowedRolls <= 0} onClick={() => setSubstat(index, { key, value: parseFloat(newValue) })}>{newValue}</Button>
        })}
      </ButtonGroup>
    </Box>
    <Box sx={{ p: 1, }}>
      {error ? <SqBadge color="error">{t`ui:error`}</SqBadge> : <Grid container>
        <Grid item>
          <SqBadge color={rollNum === 0 ? "secondary" : `roll${clamp(rollNum, 1, 6)}`}>
            {rollNum ? t("editor.substat.RollCount", { count: rollNum }) : t`editor.substat.noRoll`}
          </SqBadge>
        </Grid>
        <Grid item flexGrow={1}>
          {!!rolls.length && [...rolls].sort().map(val =>
            <Typography component="span" key={val} color={`roll${clamp(rollOffset + rollData.indexOf(val), 1, 6)}.main`} sx={{ ml: 1 }} >{valueString(val, unit)}</Typography>)}
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
