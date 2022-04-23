import { Replay } from '@mui/icons-material';
import { Button, CardContent, Divider, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { artifactSlotIcon } from '../../../../Components/Artifact/SlotNameWIthIcon';
import BootstrapTooltip from '../../../../Components/BootstrapTooltip';
import SqBadge from '../../../../Components/SqBadge';
import StatIcon from '../../../../Components/StatIcon';
import Artifact from '../../../../Data/Artifacts/Artifact';
import KeyMap from '../../../../KeyMap';
import { MainStatKey } from '../../../../Types/artifact';
import { BuildSetting } from '../../../../Types/Build';
import { SlotKey } from '../../../../Types/consts';

export const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"] as const

export default function MainStatSelectionCard({ mainStatKeys, onChangeMainStatKey, disabled = false, }: {
  mainStatKeys: BuildSetting["mainStatKeys"]
  onChangeMainStatKey: (slotKey: SlotKey, mainStatKey?: MainStatKey) => void
  disabled?: boolean
}) {
  const { t } = useTranslation("artifact")
  return <Box display="flex" flexDirection="column" gap={1}>
    {artifactsSlotsToSelectMainStats.map(slotKey => {
      const numSel = mainStatKeys[slotKey].length
      return <Box key={slotKey}>
        <Divider />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={12} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <BootstrapTooltip placement="top" title={<Typography>{t(`slotName.${slotKey}`)}</Typography>}>
                <span>{artifactSlotIcon(slotKey)}</span>
              </BootstrapTooltip>
              <Box flexGrow={1}>
                <SqBadge color="info">{numSel ? `${numSel} Selected` : `Any`}</SqBadge>
              </Box>
              <Button color="error" size="small" disabled={!mainStatKeys[slotKey].length || disabled} sx={{ mt: -1, mb: -1 }}
                onClick={() => onChangeMainStatKey(slotKey)}>
                <Replay />
              </Button>
            </Grid>
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
      </Box>
    })}
  </Box >
}
