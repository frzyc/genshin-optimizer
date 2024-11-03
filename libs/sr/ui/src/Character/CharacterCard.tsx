import { CardThemed } from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { ICachedCharacter } from '@genshin-optimizer/sr/db'
import type { Calculator } from '@genshin-optimizer/sr/formula'
import {
  charData,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import { statToFixed } from '@genshin-optimizer/sr/util'
import {
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
}: {
  character: ICachedCharacter
  onClick?: () => void
}) {
  const calc =
    useSrCalcContext() ?? srCalculatorWithEntries(charData(character))

  return (
    <Stack>
      <CardThemed>
        <CardContent>
          {onClick ? (
            <CardActionArea onClick={onClick}>
              <Typography variant="h4">
                <CharacterName characterKey={character.key} />
              </Typography>
            </CardActionArea>
          ) : (
            <Typography variant="h4">
              <CharacterName characterKey={character.key} />
            </Typography>
          )}
          <Divider />
          <Typography>Eidolon: {character.eidolon}</Typography>
          <Typography>Level: {character.level}</Typography>

          {stats.map((statKey) => (
            <StatLine
              key={statKey}
              calc={calc}
              statKey={statKey}
              characterKey={character.key}
            />
          ))}
        </CardContent>
      </CardThemed>
    </Stack>
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
