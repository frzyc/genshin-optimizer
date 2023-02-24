import { CharacterKey } from '@genshin-optimizer/consts';
import { characterAsset } from '@genshin-optimizer/g-assets';
import { Box, CardActionArea, Skeleton, Typography } from '@mui/material';
import { ReactNode, Suspense, useCallback } from 'react';
import Assets from '../../Assets/Assets';
import { getCharSheet } from '../../Data/Characters';
import { ascensionMaxLevel } from '../../Data/LevelData';
import { ElementIcon } from '../../KeyMap/StatIcon';
import useCharacter from '../../ReactHooks/useCharacter';
import useDBMeta from '../../ReactHooks/useDBMeta';
import BootstrapTooltip from '../BootstrapTooltip';
import CardDark from '../Card/CardDark';
import ConditionalWrapper from '../ConditionalWrapper';
import SqBadge from '../SqBadge';
import CharacterCard from './CharacterCard';

export default function CharacterCardPico({ characterKey = "", index = -1, onClick, simpleTooltip = false, }:
  { characterKey: CharacterKey | "", index?: number, onClick?: (characterKey: CharacterKey) => void, simpleTooltip?: boolean }) {
  const { gender } = useDBMeta()
  const characterSheet = characterKey ? getCharSheet(characterKey, gender) : undefined
  const character = useCharacter(characterKey)
  const onClickHandler = useCallback(() => characterKey && onClick?.(characterKey), [characterKey, onClick])
  const actionWrapperFunc = useCallback(
    children => <CardActionArea onClick={onClickHandler}>{children}</CardActionArea>,
    [onClickHandler])

  const simpleTooltipWrapperFunc = useCallback((children: ReactNode) =>
    <BootstrapTooltip placement="top" title={
      characterSheet && <Suspense fallback={<Skeleton width={300} height={400} />}><Typography>{characterSheet.elementKey && <ElementIcon ele={characterSheet.elementKey} iconProps={{
        fontSize: "inherit",
        sx: { verticalAlign: "-10%", color: `${characterSheet.elementKey}.main` }
      }} />} {characterSheet.name}</Typography></Suspense>
    }>
      {children as JSX.Element}
    </BootstrapTooltip>, [characterSheet])
  const charCardTooltipWrapperFunc = useCallback((children: ReactNode) =>
    <BootstrapTooltip enterNextDelay={1000} enterTouchDelay={1000} placement="top" title={
      <Box sx={{ width: 300, m: -1 }}>
        <CharacterCard hideStats characterKey={characterKey as CharacterKey} />
      </Box>
    }>
      {children as JSX.Element}
    </BootstrapTooltip>, [characterKey])
  if (characterSheet && character && characterKey) {
    return <ConditionalWrapper condition={simpleTooltip} wrapper={simpleTooltipWrapperFunc} falseWrapper={charCardTooltipWrapperFunc}>
      <CardDark sx={{ maxWidth: 128, position: "relative", display: "flex", flexDirection: "column", }}>
        <ConditionalWrapper condition={!!onClick} wrapper={actionWrapperFunc}>
          <Box display="flex" className={`grad-${characterSheet.rarity}star`}>
            {characterKey && <Box
              component="img"
              src={characterAsset(characterKey, "iconSide", gender)}
              maxWidth="100%"
              maxHeight="100%"
              sx={{ transform: "scale(1.4)", transformOrigin: "bottom" }}
            />}
          </Box>
          <Typography sx={{ position: "absolute", fontSize: "0.75rem", lineHeight: 1, opacity: 0.85, pointerEvents: "none", top: 0, }}>
            <strong><SqBadge color="primary" >{character.level}/{ascensionMaxLevel[character.ascension]}</SqBadge></strong>
          </Typography>
          <Typography sx={{ position: "absolute", fontSize: "0.75rem", lineHeight: 1, opacity: 0.85, pointerEvents: "none", bottom: 0, right: 0, }}>
            <strong><SqBadge color="secondary" >C{character.constellation}</SqBadge></strong>
          </Typography>
        </ConditionalWrapper>
      </CardDark>
    </ConditionalWrapper>
  } else {
    return <CardDark sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: "12.5%" }}>
      <Box component="img" src={Assets.team[`team${index + 2}`]} sx={{ width: "75%", height: "auto", opacity: 0.7 }} />
    </CardDark>
  }
}
