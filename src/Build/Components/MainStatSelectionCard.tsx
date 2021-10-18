import { Info, Replay } from '@mui/icons-material';
import { Button, CardContent, Divider, Grid, MenuItem, Typography } from '@mui/material';
import React from 'react';
import Artifact from '../../Artifact/Artifact';
import SlotNameWithIcon from '../../Artifact/Component/SlotNameWIthIcon';
import BootstrapTooltip from '../../Components/BootstrapTooltip';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import SqBadge from '../../Components/SqBadge';
import StatIcon from '../../Components/StatIcon';
import Stat from '../../Stat';
import { MainStatKey } from '../../Types/artifact';
import { BuildSetting } from '../../Types/Build';
import { SlotKey } from '../../Types/consts';

export const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"] as const

export default function MainStatSelectionCard({ mainStatAssumptionLevel, mainStatKeys, onChangeMainStatKey, onChangeAssLevel, disabled = false, }: {
  mainStatAssumptionLevel: number
  mainStatKeys: BuildSetting["mainStatKeys"]
  onChangeMainStatKey: (slotKey: SlotKey, mainStatKey?: MainStatKey) => void
  onChangeAssLevel: (level: number) => void
  disabled?: boolean
}) {
  return <CardLight>
    <CardContent sx={{ py: 1 }} >
      <Grid container alignItems="center" spacing={2}>
        <Grid item flexGrow={1}>
          <Typography>Artifact Main Stat</Typography>
        </Grid>
        <Grid item>
          <BootstrapTooltip placement="top" title={<Typography><strong>Level Assumption</strong> changes mainstat value to be at least a specific level. Does not change substats.</Typography>}>
            <Info />
          </BootstrapTooltip>
        </Grid>
        <Grid item>
          <AssumeFullLevelToggle mainStatAssumptionLevel={mainStatAssumptionLevel} setmainStatAssumptionLevel={v => onChangeAssLevel(v)} disabled={disabled} />
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent sx={{
      // select all excluding last
      "> div:nth-last-of-type(n+2)": { mb: 1 }
    }}>
      {artifactsSlotsToSelectMainStats.map(slotKey => {
        const numSel = mainStatKeys[slotKey].length
        return <CardDark key={slotKey}>
          <CardContent sx={{ py: 1 }}><Grid container spacing={1}>
            <Grid item ><SlotNameWithIcon slotKey={slotKey} /></Grid>
            <Grid item flexGrow={1}>
              <SqBadge color="info">{numSel ? `${numSel} Selected` : `Any`}</SqBadge>
            </Grid>
            <Grid item>
              <Button color="error" size="small" disabled={!mainStatKeys[slotKey].length}
                onClick={() => onChangeMainStatKey(slotKey)}>
                <Replay />
              </Button>
            </Grid>
          </Grid></CardContent>
          <Divider />
          <CardContent>
            <Grid container spacing={1}>
              {Artifact.slotMainStats(slotKey).map((mainStatKey, i) => {
                const selected = mainStatKeys[slotKey].includes(mainStatKey)
                return <Grid item xs={i < 3 ? 4 : 6} key={mainStatKey} >
                  <Button fullWidth size="small" color={selected ? "success" : "secondary"} disabled={disabled} sx={{ height: "100%" }}
                    onClick={() => onChangeMainStatKey(slotKey, mainStatKey)} startIcon={StatIcon[mainStatKey]}>
                    {Stat.getStatNameWithPercent(mainStatKey, "", false)}
                  </Button>
                </Grid>
              })}
            </Grid>
          </CardContent>
        </CardDark>
      })}
    </CardContent>
  </CardLight>
}

const levels = {
  0: <span>No level assumption</span>,
  4: <span>Assume at least level 4</span>,
  8: <span>Assume at least level 8</span>,
  12: <span>Assume at least level 12</span>,
  16: <span>Assume at least level 16</span>,
  20: <span>Assume at least level 20</span>
} as const
function AssumeFullLevelToggle({ mainStatAssumptionLevel = 0, setmainStatAssumptionLevel, disabled }) {
  return <DropdownButton color={mainStatAssumptionLevel ? "warning" : "primary"} disabled={disabled} title={levels[mainStatAssumptionLevel]}>
    {Object.entries(levels).map(([key, text]) => <MenuItem key={key} onClick={() => setmainStatAssumptionLevel(parseInt(key))}>{text}</MenuItem>)}
  </DropdownButton>
}
