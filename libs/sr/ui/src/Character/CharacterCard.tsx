import {
  CardThemed,
  ColorText,
  NextImage,
  StarsDisplay,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  characterKeyToGenderedKey,
} from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { ICachedCharacter } from '@genshin-optimizer/sr/db'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import {
  charTagMapNodeEntries,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import { getCharStat } from '@genshin-optimizer/sr/stats'
import { ElementIcon, PathIcon } from '@genshin-optimizer/sr/svgicons'
import { getLevelString, statToFixed } from '@genshin-optimizer/sr/util'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useSrCalcContext } from '../Hook'
import { CharacterName } from './CharacterTrans'
import { StatDisplay } from './StatDisplay'

const stats = [
  'hp',
  'atk',
  'def',
  'spd',
  'crit_',
  'crit_dmg_',
  'brEffect_',
  'heal_',
  'enerRegen_',
  'eff_',
  'eff_res_',
] as const
export function CharacterCard({
  character,
  onClick,
  hideStats = false,
}: {
  character: ICachedCharacter
  onClick?: () => void
  hideStats?: boolean
}) {
  const calc =
    useSrCalcContext() ??
    srCalculatorWithEntries(charTagMapNodeEntries(character, 1))

  return (
    <Stack>
      <CardThemed>
        {onClick ? (
          <CardActionArea onClick={onClick}>
            <Header character={character} />
          </CardActionArea>
        ) : (
          <Header character={character} />
        )}

        <Divider />
        {!hideStats && (
          <CardContent>
            {stats.map((statKey) => (
              <StatLine
                key={statKey}
                calc={calc}
                statKey={statKey}
                characterKey={character.key}
              />
            ))}
          </CardContent>
        )}
      </CardThemed>
    </Stack>
  )
}
function Header({ character }: { character: ICachedCharacter }) {
  const { key: characterKey, eidolon, level, ascension } = character
  const genderedKey = characterKeyToGenderedKey(characterKey)
  const { damageType, path, rarity } = getCharStat(characterKey)

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component={NextImage ? NextImage : 'img'}
        alt="Character Icon"
        src={characterAsset(genderedKey, 'icon')}
        sx={{
          maxHeight: '10em',
          width: 'auto',
        }}
      />
      <Box sx={{ px: 2, pt: 1 }}>
        <Typography variant="h5">
          <CharacterName genderedKey={genderedKey} />
        </Typography>
        <Typography>
          <StarsDisplay stars={rarity} inline />
        </Typography>
        <Typography>
          Lv.{getLevelString(level, ascension)} Eidolon: {eidolon}
        </Typography>
        <PathIcon pathKey={path} />
        <ColorText color={damageType}>
          <ElementIcon ele={damageType} />
        </ColorText>
      </Box>
    </Box>
  )
}
function StatLine({
  characterKey,
  calc,
  statKey,
}: {
  characterKey: CharacterKey
  calc: Calculator
  statKey: (typeof stats)[number]
}) {
  return (
    <Typography
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'space-between',
      }}
    >
      <StatDisplay statKey={statKey} />
      <span>
        {toPercent(
          calc
            .withTag({ src: characterKey, dst: characterKey })
            .compute(own.final[statKey]).val,
          statKey
        ).toFixed(statToFixed(statKey))}
        {getUnitStr(statKey)}
      </span>
    </Typography>
  )
}
