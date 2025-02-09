import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  commonDefIcon,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, Typography } from '@mui/material'

// TODO: Replace hardcoded skill values once characterDb provides the correct information
const boxData: { src: SkillKey; text: string }[] = [
  { src: 'basic', text: '1' },
  { src: 'dodge', text: '12' },
  { src: 'assist', text: '1' },
  { src: 'special', text: '5' },
  { src: 'chain', text: '6' },
  { src: 'core', text: '6' },
]

export function CharacterCardContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const { database } = useDatabaseContext()
  const character =
    useCharacter(characterKey) ??
    (characterKey ? database.chars.getOrCreate(characterKey) : undefined)

  const charStat = getCharStat(characterKey)
  const chKey = character?.key
  const cSpecialty = charStat?.specialty
  const cAttribute = charStat?.attribute
  const characterLevel = character?.level
  const cRarity = charStat?.rarity
  return (
    <>
      <Box display="flex" gap={1.5} alignItems="center">
        <ImgIcon size={2} src={rarityDefIcon(cRarity)} />
        <Typography variant="h4">{chKey}</Typography>
        <ElementIcon ele={cAttribute} />
        <ImgIcon size={2} src={specialityDefIcon(cSpecialty)} />
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
            <strong>Lv.{characterLevel}</strong>
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} marginLeft="14px" alignItems="center">
          {boxData.map((item, index) => (
            <Box key={index} position="relative">
              <ImgIcon size={2} src={commonDefIcon(item.src)} />
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
                {item.text}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  )
}
