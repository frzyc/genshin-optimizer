import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  commonDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import { type CharacterKey, allSkillKeys } from '@genshin-optimizer/zzz/consts'
import { useCharacter } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { CharacterName } from '../CharacterTrans'

export function CharacterCardContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { t } = useTranslation('page_characters')
  const character = useCharacter(characterKey)!
  const { rarity, specialty, attribute } = getCharStat(characterKey)
  const { level, core } = character
  return (
    <>
      <Box display="flex" gap={1.5} alignItems="center">
        <ImgIcon size={2} src={rarityDefIcon(rarity)} />
        <Typography variant="h4">
          <CharacterName characterKey={characterKey} />
        </Typography>
        <ElementIcon ele={attribute} />
        <ImgIcon size={2} src={specialityDefIcon(specialty)} />
      </Box>

      <Box display="flex" gap={3} alignItems="center">
        <Box>
          <Typography
            component="span"
            variant="h5"
            whiteSpace="nowrap"
            fontStyle="italic"
            fontWeight="bold"
            fontSize="1.625rem"
            sx={{
              textShadow: 'none',
            }}
          >
            <strong>{t('characterCard.charLevel', { level: level })}</strong>
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} marginLeft="14px" alignItems="center">
          {allSkillKeys.map((item, _index) => (
            <Box key={item} position="relative">
              <ImgIcon size={2} src={commonDefIcon(item)} />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="absolute"
                bottom="-10px"
                left="-4px"
                width="1.7em"
                height="1.7em"
                borderRadius="1rem"
                fontWeight="bold"
                fontSize="0.8rem"
                sx={{
                  background: '#1C1C1C',
                }}
              >
                {character[item]}
              </Box>
            </Box>
          ))}
          <Box position="relative">
            <ImgIcon size={2} src={commonDefIcon('core')} />
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              position="absolute"
              bottom="-10px"
              left="-4px"
              width="1.7em"
              height="1.7em"
              borderRadius="1rem"
              fontWeight="bold"
              fontSize="0.8rem"
              sx={{
                background: '#1C1C1C',
              }}
            >
              {core}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
