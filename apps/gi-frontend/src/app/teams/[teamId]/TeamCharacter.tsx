'use client'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { convert, selfTag } from '@genshin-optimizer/gi/formula'
import { CalcContext, MemberContext } from '@genshin-optimizer/pando/ui-sheet'
import { CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { CalcWrapper } from './CalcWrapper'
import CharacterTalentPane from './TalentContent'
import { TeamContext } from './TeamContext'
import type { TeamLoadoutCharacter } from './getTeam'

// TODO: probably put this into sub page, like [charKey]
export function TeamCharacter() {
  const team = useContext(TeamContext)
  const [charIndex] = useState(0)
  if (!team) return null
  const character = team?.team_loadouts[charIndex]?.loadout?.character
  if (!character) return null
  const { key } = character
  return (
    <CalcWrapper>
      <CardThemed>
        <CardHeader title={`Character: ${key}`} />
        <CardContent>
          <Content character={character} />
        </CardContent>
      </CardThemed>
    </CalcWrapper>
  )
}

function Content({ character }: { character: TeamLoadoutCharacter }) {
  const calc = useContext(CalcContext)
  const member = useMemo(() => convert(selfTag, { et: 'self', src: '0' }), [])
  if (!calc) return null
  return (
    <MemberContext.Provider value={member}>
      <Stack spacing={1}>
        <CardThemed bgt="light">
          <CardContent>
            <Typography>{character.key}</Typography>
            <Typography>HP:{calc.compute(member.final.hp).val}</Typography>
            <Typography>ATK:{calc.compute(member.final.atk).val}</Typography>
            <Typography>DEF:{calc.compute(member.final.def).val}</Typography>
          </CardContent>
        </CardThemed>
        <CardThemed bgt="light">
          <CardContent>
            <Typography>Talent</Typography>
          </CardContent>
        </CardThemed>
        <CharacterTalentPane character={character} calc={calc} />
      </Stack>
    </MemberContext.Provider>
  )
}
