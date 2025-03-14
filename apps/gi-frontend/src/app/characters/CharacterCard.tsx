import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  charData,
  convert,
  genshinCalculatorWithEntries,
  ownTag,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { ICharacter } from '@genshin-optimizer/gi/good'
import type { Tables } from '@genshin-optimizer/gi/supabase'
import { CardContent, Typography } from '@mui/material'
export function CharacterCard({
  character,
}: {
  character: Tables<'characters'>
}) {
  const calc = genshinCalculatorWithEntries(
    withMember(
      '0',
      ...charData({
        key: character.key,
        level: character.level,
        talent: {
          auto: character.talent_auto,
          skill: character.talent_skill,
          burst: character.talent_burst,
        },
        ascension: character.ascension as ICharacter['ascension'],
        constellation: character.constellation as ICharacter['constellation'],
      }),
    ),
  )
  const member0 = convert(ownTag, { et: 'own', src: '0' })
  return (
    <CardThemed>
      <CardContent>
        <Typography>{character.key}</Typography>
        <Typography>HP:{calc.compute(member0.final.hp).val}</Typography>
        <Typography>ATK:{calc.compute(member0.final.atk).val}</Typography>
        <Typography>DEF:{calc.compute(member0.final.def).val}</Typography>
      </CardContent>
    </CardThemed>
  )
}
