import { Box, Grid, Skeleton, Typography } from '@mui/material';
import { Suspense } from 'react';
import Assets from '../Assets/Assets';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import SqBadge from '../Components/SqBadge';
import StatIcon from '../Components/StatIcon';
import CharacterSheet from '../Data/Characters/CharacterSheet';
import { ascensionMaxLevel } from '../Data/LevelData';
import useCharacter from '../ReactHooks/useCharacter';
import usePromise from '../ReactHooks/usePromise';
import { CharacterKey } from '../Types/consts';

export default function CharacterCardPico({ characterKey = "", index }: { characterKey: CharacterKey | "", index: number }) {
  const teammateSheet = usePromise(CharacterSheet.get(characterKey), [characterKey])
  const character = useCharacter(characterKey)
  if (teammateSheet && character) {
    const title = <Suspense fallback={<Skeleton variant="text" width={100} />}>
      <Typography>{teammateSheet.elementKey && StatIcon[teammateSheet.elementKey]} {teammateSheet.name}</Typography>
    </Suspense>

    return <CardDark sx={{ height: "100%", maxWidth: 128 }}>
      <Grid container columns={2} direction="row">
        <BootstrapTooltip placement="top" title={title}>
          <Box display="flex" className={`grad-${teammateSheet.rarity}star`}>
            <Box
              component="img"
              src={teammateSheet.thumbImgSide}
              width="100%"
              height="auto"
              sx={{ transform: "scale(1.4)", transformOrigin: "bottom" }}
            />
          </Box>
        </BootstrapTooltip>
        <Box width="100%">
          <Typography variant='subtitle1' sx={{ display: "flex", height: "100%" }}>
            <SqBadge color="primary" sx={{ flexGrow: 5, borderRadius: 0, pl: 0.25, pr: 0.25 }}>{character.level}/{ascensionMaxLevel[character.ascension]}</SqBadge>
            <SqBadge color="secondary" sx={{ flexGrow: 1, borderRadius: 0, pl: 0.25, pr: 0.25 }}>C{character.constellation}</SqBadge>
          </Typography>
        </Box>
      </Grid>
    </CardDark>
  } else {
    return <CardDark sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", py: "12.5%" }}>
      <Box component="img" src={Assets.team[`team${index + 2}`]} sx={{ width: "75%", height: "auto", opacity: 0.7 }} />
    </CardDark>
  }
}
