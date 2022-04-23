import { Box, Grid, Typography } from '@mui/material';
import Assets from '../../Assets/Assets';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import KeyMap, { cacheValueString } from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import { ICachedArtifact } from '../../Types/artifact';
import { SlotKey } from '../../Types/consts';
import ArtifactSetSlotTooltip from './ArtifactSetSlotTooltip';
import BootstrapTooltip from '../BootstrapTooltip';
import CardDark from '../Card/CardDark';
import SqBadge from '../SqBadge';
import StatIcon from '../StatIcon';

export default function ArtifactCardPico({ artifactObj: art, slotKey: key }: { artifactObj: ICachedArtifact | undefined, slotKey: SlotKey }) {
  const artifactSheet = usePromise(art?.setKey && ArtifactSheet.get(art.setKey), [art?.setKey])
  // Blank artifact slot icon
  if (!art || !artifactSheet) return <Grid item key={key} xs={1}>
    <CardDark sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ width: "100%", pb: "100%", position: "relative", }}>
        <Box
          sx={{
            position: "absolute",
            width: "70%", height: "70%",
            left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.7
          }}
          component="img"
          src={Assets.slot[key]}
        />
      </Box>
    </CardDark>
  </Grid>

  // Actual artifact icon + info
  const { mainStatKey, rarity, level, mainStatVal } = art
  const levelVariant = "roll" + (Math.floor(Math.max(level, 0) / 4) + 1)
  return <Grid item key={key} xs={1}>
    <CardDark sx={{ display: "flex", flexDirection: "column", position: "relative" }}>
      <ArtifactSetSlotTooltip slotKey={key} sheet={artifactSheet}>
        <Box
          component="img"
          className={`grad-${rarity}star`}
          src={artifactSheet.slotIcons[key]}
          maxWidth="100%"
          maxHeight="100%"
        />
      </ArtifactSetSlotTooltip>
      <Typography sx={{ position: "absolute", lineHeight: 1, pointerEvents: "none" }} variant="subtitle2"><SqBadge color={levelVariant as any}>+{level}</SqBadge></Typography>
      <Typography variant='h6' sx={{ position: "absolute", bottom: 0, right: 0, lineHeight: 1, }}>
        <BootstrapTooltip placement="top" title={<Typography>{cacheValueString(mainStatVal, KeyMap.unit(mainStatKey))}{KeyMap.unit(mainStatKey)} {KeyMap.getStr(mainStatKey)}</Typography>} disableInteractive>
          <SqBadge color="secondary" sx={{ p: 0.25 }}>{StatIcon[mainStatKey]}</SqBadge>
        </BootstrapTooltip>
      </Typography>
    </CardDark>
  </Grid>
}
