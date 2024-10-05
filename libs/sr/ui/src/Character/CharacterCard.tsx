import { CardThemed } from '@genshin-optimizer/common/ui'
import type { ICachedCharacter } from '@genshin-optimizer/sr/db'
import {
  charData,
  own,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/ui'
import {
  CardActionArea,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'

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
              <Typography variant="h4">{character.key}</Typography>
            </CardActionArea>
          ) : (
            <Typography variant="h4">{character.key}</Typography>
          )}
          <Divider />
          <Typography>Eidolon: {character.eidolon}</Typography>
          <Typography>Level: {character.level}</Typography>

          <Typography>ATK: {calc.compute(own.final.atk).val}</Typography>

          <Typography>
            Break effect: {calc.compute(own.final.brEffect_).val}
          </Typography>
          <Typography>
            CRIT Rate: {calc.compute(own.final.crit_).val}
          </Typography>
          <Typography>
            CRIT DMG: {calc.compute(own.final.crit_dmg_).val}
          </Typography>
          <Typography>DEF: {calc.compute(own.final.def).val}</Typography>
          <Typography>
            Effect Hit Rate: {calc.compute(own.final.eff_).val}
          </Typography>
          <Typography>
            Effect RES: {calc.compute(own.final.eff_res_).val}
          </Typography>
          <Typography>
            Energy Regeneration Rate: {calc.compute(own.final.enerRegen_).val}
          </Typography>
          <Typography>
            Heal Boost: {calc.compute(own.final.heal_).val}
          </Typography>
          <Typography>HP: {calc.compute(own.final.hp).val}</Typography>
          <Typography>Speed: {calc.compute(own.final.spd).val}</Typography>
        </CardContent>
      </CardThemed>
    </Stack>
  )
}
