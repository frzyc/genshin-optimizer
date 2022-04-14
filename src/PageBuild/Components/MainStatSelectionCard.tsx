import { Replay } from '@mui/icons-material';
import { Button, CardContent, Divider, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { artifactSlotIcon } from '../../Components/Artifact/SlotNameWIthIcon';
import BootstrapTooltip from '../../Components/BootstrapTooltip';
import CardLight from '../../Components/Card/CardLight';
import SqBadge from '../../Components/SqBadge';
import StatIcon from '../../Components/StatIcon';
import Artifact from '../../Data/Artifacts/Artifact';
import KeyMap from '../../KeyMap';
import { MainStatKey } from '../../Types/artifact';
import { BuildSetting } from '../../Types/Build';
import { SlotKey } from '../../Types/consts';

export const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"] as const

export default function MainStatSelectionCard({ mainStatKeys, onChangeMainStatKey, disabled = false, }: {
  mainStatKeys: BuildSetting["mainStatKeys"]
  onChangeMainStatKey: (slotKey: SlotKey, mainStatKey?: MainStatKey) => void
  disabled?: boolean
}) {
  return <Box display="flex" flexDirection="column" gap={1}>
    {artifactsSlotsToSelectMainStats.map(slotKey => {
      const numSel = mainStatKeys[slotKey].length
      return <CardLight key={slotKey}>
        <CardContent sx={{ py: 1 }}><Grid container spacing={1}>
          <Grid item >{artifactSlotIcon(slotKey)}</Grid>
          <Grid item flexGrow={1}>
            <SqBadge color="info">{numSel ? `${numSel} Selected` : `Any`}</SqBadge>
          </Grid>
          <Grid item>
            <Button color="error" size="small" disabled={!mainStatKeys[slotKey].length || disabled}
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
                <BootstrapTooltip placement="top" title={<Typography><strong>{KeyMap.getArtStr(mainStatKey)}</strong></Typography>} disableInteractive>
                  <Button fullWidth size="small" color={selected ? "success" : "secondary"} disabled={disabled} sx={{ height: "100%" }}
                    onClick={() => onChangeMainStatKey(slotKey, mainStatKey)}>
                    {StatIcon[mainStatKey]}
                  </Button>
                </BootstrapTooltip>
              </Grid>
            })}
          </Grid>
        </CardContent>
      </CardLight>
    })}
  </Box >
}
