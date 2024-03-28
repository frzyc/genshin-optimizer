import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, Container, Pagination, Stack, Typography } from '@mui/material'
import { CharacterDataManager, ICachedSroCharacter } from '@genshin-optimizer/sr/db'
import { CharacterCard, useDatabaseContext } from '@genshin-optimizer/sr/ui'

export function CharacterInventory() {
  const { database } = useDatabaseContext()

  const characterCards = database.chars.values.map((char: ICachedSroCharacter, index) => {
    let name = char.key
    let eidolon = char.eidolon
    let level = char.level

    return (
      <CharacterCard key={index} character={char} />
    )
  }).slice(0, 5); /* for now, get the first 5 to see some changes */

  return (
    <Container>
      <CardThemed bgt='dark'>
        <CardContent>
          {characterCards}
        </CardContent>

        <Pagination count={characterCards.length} />
      </CardThemed>
    </Container>
  )
}
