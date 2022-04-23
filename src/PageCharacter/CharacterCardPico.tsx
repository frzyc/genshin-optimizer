import { Box, Skeleton, Typography } from '@mui/material';
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

    return <CardDark sx={{ maxWidth: 128, position: "relative", display: "flex", flexDirection: "column", }}>
      <BootstrapTooltip placement="top" title={title}>
        <Box display="flex" className={`grad-${teammateSheet.rarity}star`}>
          <Box
            component="img"
            src={teammateSheet.thumbImgSide}
            maxWidth="100%"
            maxHeight="100%"
            sx={{ transform: "scale(1.4)", transformOrigin: "bottom" }}
          />
        </Box>
      </BootstrapTooltip>
      <Typography variant='subtitle1' sx={{ position: "absolute", lineHeight: 1, pointerEvents: "none" }}>
        <SqBadge color="primary" >{character.level}/{ascensionMaxLevel[character.ascension]}</SqBadge>
      </Typography>
      <Typography variant='subtitle1' sx={{ position: "absolute", bottom: 0, right: 0, lineHeight: 1, pointerEvents: "none" }}>
        <SqBadge color="secondary" >C{character.constellation}</SqBadge>
      </Typography>
    </CardDark>
  } else {
    return <CardDark sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: "12.5%" }}>
      <Box component="img" src={Assets.team[`team${index + 2}`]} sx={{ width: "75%", height: "auto", opacity: 0.7 }} />
    </CardDark>
  }
}
