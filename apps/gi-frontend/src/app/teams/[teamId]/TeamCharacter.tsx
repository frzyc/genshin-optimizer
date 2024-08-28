'use client'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { members, own } from '@genshin-optimizer/gi/formula'
import { useGiCalcContext } from '@genshin-optimizer/gi/formula-ui'
import { CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { useContext, useState } from 'react'
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
    <CalcWrapper src={members[charIndex]}>
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
  const calc = useGiCalcContext()
  if (!calc) return null
  return (
    <Stack spacing={1}>
      <CardThemed bgt="light">
        <CardContent>
          <Typography>{character.key}</Typography>
          <Typography>HP:{calc.compute(own.final.hp).val}</Typography>
          <Typography>ATK:{calc.compute(own.final.atk).val}</Typography>
          <Typography>DEF:{calc.compute(own.final.def).val}</Typography>
        </CardContent>
      </CardThemed>
      <CardThemed bgt="light">
        <CardContent>
          <Typography>Talent</Typography>
        </CardContent>
      </CardThemed>
      <CharacterTalentPane character={character} calc={calc} />
    </Stack>
  )
}
