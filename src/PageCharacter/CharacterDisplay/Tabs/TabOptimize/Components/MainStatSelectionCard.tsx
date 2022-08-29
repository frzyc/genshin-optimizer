import { Replay } from '@mui/icons-material';
import { Button, CardContent, Divider, Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { artifactSlotIcon } from '../../../../../Components/Artifact/SlotNameWIthIcon';
import BootstrapTooltip from '../../../../../Components/BootstrapTooltip';
import SqBadge from '../../../../../Components/SqBadge';
import { StatColoredWithUnit } from '../../../../../Components/StatDisplay';
import StatIcon from '../../../../../Components/StatIcon';
import { CharacterContext } from '../../../../../Context/CharacterContext';
import Artifact from '../../../../../Data/Artifacts/Artifact';
import { allElementsWithPhy } from '../../../../../Types/consts';
import useBuildSetting from '../useBuildSetting';

export const artifactsSlotsToSelectMainStats = ["sands", "goblet", "circlet"] as const

export default function MainStatSelectionCard({ disabled = false, }: {
  disabled?: boolean
}) {
  const { t } = useTranslation("artifact")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting: { mainStatKeys }, buildSettingDispatch } = useBuildSetting(characterKey)

  return <Box display="flex" flexDirection="column" gap={1}>
    {artifactsSlotsToSelectMainStats.map(slotKey => {
      const numSel = mainStatKeys[slotKey].length
      return <Box key={slotKey}>
        <Divider />
        <CardContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", pb: 1 }}>
            <BootstrapTooltip placement="top" title={<Typography>{t(`slotName.${slotKey}`)}</Typography>}>
              <span>{artifactSlotIcon(slotKey)}</span>
            </BootstrapTooltip>
            <Box flexGrow={1}>
              <SqBadge color="info">{numSel ? `${numSel} Selected` : `Any`}</SqBadge>
            </Box>
            <Button color="error" size="small" disabled={!mainStatKeys[slotKey].length || disabled} sx={{ mt: -1, mb: -1 }}
              onClick={() => buildSettingDispatch({ type: "mainStatKey", slotKey })}>
              <Replay />
            </Button>
          </Box>
          <Grid container spacing={1}>
            {Artifact.slotMainStats(slotKey).map((mainStatKey, i) => {
              const element = allElementsWithPhy.find(ele => mainStatKey.includes(ele))
              const color = mainStatKeys[slotKey].includes(mainStatKey)
                ? element ?? "success"
                : "secondary"
              return <Grid item key={mainStatKey} flexGrow={1} xs={(i < 3 && slotKey !== "goblet") ? 4 : undefined} >
                <BootstrapTooltip placement="top" title={<Typography><strong><StatColoredWithUnit statKey={mainStatKey} /></strong></Typography>} disableInteractive>
                  <Button fullWidth size="small" color={color} sx={{ fontSize: "1.2em", height: "100%", pointerEvents: disabled ? "none" : undefined, cursor: disabled ? "none" : undefined }}
                    onClick={() => buildSettingDispatch({ type: "mainStatKey", slotKey, mainStatKey })}>
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
