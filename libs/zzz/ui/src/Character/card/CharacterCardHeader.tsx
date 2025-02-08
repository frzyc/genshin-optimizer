import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  commonDefIcon,
  commonKey,
  rarityDefIcon,
  specialityDefIcon,
} from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/zzz/db-ui'
import { getCharStat } from '@genshin-optimizer/zzz/stats'
import { ElementIcon } from '@genshin-optimizer/zzz/svgicons'
import { Box, Typography } from '@mui/material'

const boxData: { src: commonKey; text: string }[] = [
  { src: 'normal', text: '1' },
  { src: 'evade', text: '12' },
  { src: 'assist', text: '1' },
  { src: 'skill', text: '5' },
  { src: 'chain', text: '6' },
  { src: 'core', text: '6' },
]

export function CharacterCardHeader({
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
      <Box
        display="flex"
        gap={1}
        sx={{ textShadow: '0 0 5px gray' }}
        alignItems="center"
      >
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
            variant="h4"
            whiteSpace="nowrap"
            color={tcOverride ? 'yellow ' : undefined}
          >
            Lv. {characterLevel}
          </Typography>
        </Box>
        <Box
          display="flex"
          gap={1}
          sx={{ textShadow: '0 0 5px gray' }}
          alignItems="center"
        >
          {boxData.map((item, index) => (
            <Box key={index} position="relative">
              <ImgIcon size={2.3} src={commonDefIcon(item.src)} />
              <Typography
                variant="subtitle1"
                sx={{
                  position: 'absolute',
                  left: '-3px',
                  top: '10px',
                  padding: '4px',
                  width: '26px',
                  height: '26px',
                  boxSizing: 'border-box',
                  background: '#1c1c1c',
                  textAlign: 'center',
                  lineHeight: '18px',
                  borderRadius: '50%',
                  fontWeight: 'bold',
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
