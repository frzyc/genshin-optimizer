import { CardThemed } from '@genshin-optimizer/common/ui'
import { Box, CardContent, Container, Pagination } from '@mui/material'
import { CharacterCard, useDatabaseContext } from '@genshin-optimizer/sr/ui'
import { useState } from 'react'
import { paginateList } from '@genshin-optimizer/common/util'

export function CharacterInventory() {
  const { database } = useDatabaseContext()
  const pageLimit = 10;
  const characters = database.chars.values;
  const [pageNumber, setPageNumber] = useState(1);

  const onPageChange = (_: React.ChangeEvent<unknown>, n: number) => {
    setPageNumber(n);
  };

  return (
    <Container>
      <CardThemed bgt='dark'>
        <CardContent>
          {
            paginateList(characters, pageLimit, pageNumber).map((c, i) => {
              return <CharacterCard key={i} character={c} />;
            })
          }
        </CardContent>

        <Box display="flex" justifyContent="center" padding={4}>
          <Pagination count={Math.ceil(characters.length / pageLimit)} onChange={onPageChange} />
        </Box>
      </CardThemed>
    </Container>
  )
}

