import { Box, Skeleton, Typography } from '@mui/material';
import { Suspense } from 'react';
import Assets from '../../Assets/Assets';
import CharacterSheet from '../../Data/Characters/CharacterSheet';
import { ascensionMaxLevel } from '../../Data/LevelData';
import useCharacter from '../../ReactHooks/useCharacter';
import usePromise from '../../ReactHooks/usePromise';
import { CharacterKey } from '../../Types/consts';
import BootstrapTooltip from '../BootstrapTooltip';
import CardDark from '../Card/CardDark';
import SqBadge from '../SqBadge';
import StatIcon from '../StatIcon';

export default function CharacterCardPico({ characterKey = "", index = -1 }: { characterKey: CharacterKey | "", index?: number }) {
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
      <Typography variant='subtitle1' sx={{ position: "absolute", mt: -0.2, lineHeight: 1, pointerEvents: "none" }}>
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
