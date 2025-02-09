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
  tcOverride = false,
}: {
  characterKey: CharacterKey
  tcOverride?: boolean
}) {
  const { database } = useDatabaseContext()
  const character =
    useCharacter(characterKey) ??
    (characterKey ? database.chars.getOrCreate(characterKey) : undefined)

  const charStat = getCharStat(characterKey)
  const chKey = character?.key
  const cProfession = charStat?.specialty
  const cAttribute = charStat?.attribute
  const characterLevel = character?.level
  const cRarity = charStat?.rarity
  return (
    <>
      <Box display="flex" gap={1.5} alignItems="center">
        <ImgIcon size={2} src={rarityDefIcon(cRarity)} />
        <Typography variant="h4">{chKey}</Typography>
        <ElementIcon ele={cAttribute}></ElementIcon>
        <ImgIcon size={2} src={specialityDefIcon(cProfession)} />
      </Box>

      <Box
        display="flex"
        gap={3}
        sx={{ textShadow: '0 0 5px gray' }}
        alignItems="center"
      >
        <Box>
          <Typography
            component="span"
            variant="h5"
            whiteSpace="nowrap"
            fontStyle="italic"
            fontWeight="bold"
            sx={{
              textShadow: 'none',
              fontSize: '1.625rem',
            }}
          >
            Lv.{characterLevel}
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} marginLeft="14px" alignItems="center">
          {boxData.map((item, index) => (
            <Box key={index} position="relative">
              <ImgIcon size={2} src={commonDefIcon(item.src)} />
              <Typography
                variant="subtitle1"
                sx={{
                  position: 'absolute',
                  left: '-3px',
                  top: '10px',
                  width: '24px',
                  height: '24px',
                  background: '#1C1C1C',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  textShadow: 'none',
                  textAlign: 'center',
                }}
              >
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  )
}
