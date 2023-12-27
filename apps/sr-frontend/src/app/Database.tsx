import { DatabaseContext } from '@genshin-optimizer/sr-db'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { Card, CardContent, Container, Typography } from '@mui/material'
import React, { useContext } from 'react'

export default function Database() {
  const { database } = useContext(DatabaseContext)
  const valStrings = Object.keys(database)
  return (
    <Container>
      <Card>
        <CardThemed bgt="dark">
          <CardContent>
            <Typography variant="h5">Database Keys</Typography>
            {valStrings.map((str) => (
              <Typography key={str}>{str}</Typography>
            ))}
          </CardContent>
        </CardThemed>
      </Card>
    </Container>
  )
}
