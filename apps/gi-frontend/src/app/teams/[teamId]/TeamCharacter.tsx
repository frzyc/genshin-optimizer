'use client'

import { CardThemed } from '@genshin-optimizer/common/ui'
import { convert, selfTag } from '@genshin-optimizer/gi/formula'
import { CardContent, CardHeader, Typography } from '@mui/material'
import { useContext, useState } from 'react'
import { CalcContext } from './CalcContext'
import { CalcWrapper } from './CalcWrapper'
import { TeamContext } from './TeamContext'
import type { TeamLoadoutCharacter } from './getTeam'

// TODO: probably put this into sub page, like [charKey]
export function TeamCharacter() {
  const team = useContext(TeamContext)
  console.log({ team })
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
  if (!calc) return null
  const member0 = convert(selfTag, { src: '0', et: 'self' })
  return (
    <CardThemed bgt="light">
      <CardContent>
        <Typography>{character.key}</Typography>
        <Typography>HP:{calc.compute(member0.final.hp).val}</Typography>
        <Typography>ATK:{calc.compute(member0.final.atk).val}</Typography>
        <Typography>DEF:{calc.compute(member0.final.def).val}</Typography>
      </CardContent>
    </CardThemed>
  )
}
