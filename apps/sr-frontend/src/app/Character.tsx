import { reread } from '@genshin-optimizer/pando'
import type { AscensionKey } from '@genshin-optimizer/sr-consts'
import {
  self,
  selfBuff,
  srCalculatorWithEntries,
} from '@genshin-optimizer/sr-formula'
import {
  CharacterContext,
  useCharacter,
  useCharacterReducer,
} from '@genshin-optimizer/sr-ui'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { Box, CardContent, Stack, TextField, Typography } from '@mui/material'
import { Container } from '@mui/system'
import { useContext, useMemo } from 'react'

export default function Character() {
  const { characterKey } = useContext(CharacterContext)
  const character = useCharacter(characterKey)
  const charReducer = useCharacterReducer(characterKey)

  const calc = useMemo(
    () =>
      character &&
      srCalculatorWithEntries([
        selfBuff.char.lvl.add(character.level),
        selfBuff.char.ascension.add(character?.ascension),
        {
          tag: { src: 'char' },
          value: reread({ src: characterKey }),
        },
      ]),
    [character, characterKey]
  )

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <Stack spacing={2}>
            <Box>{characterKey}</Box>
            <TextField
              type="number"
              label="Level"
              variant="outlined"
              inputProps={{ min: 1, max: 90 }}
              value={character?.level}
              onChange={(e) => charReducer({ level: parseInt(e.target.value) })}
            />
            <TextField
              type="number"
              label="Ascension"
              variant="outlined"
              inputProps={{ min: 0, max: 6 }}
              value={character?.ascension}
              onChange={(e) =>
                charReducer({
                  ascension: parseInt(e.target.value) as AscensionKey,
                })
              }
            />
            {(
              [
                ['ATK', 'atk'],
                ['DEF', 'def'],
                ['HP', 'hp'],
                ['SPD', 'spd'],
              ] as const
            ).map(([txt, skey]) => (
              <Typography key={skey}>
                {txt}: {calc?.compute(self.stat[skey].src('char')).val}
              </Typography>
            ))}
          </Stack>
        </CardContent>
      </CardThemed>
    </Container>
  )
}
