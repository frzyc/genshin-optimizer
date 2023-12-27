import { DatabaseContext } from '@genshin-optimizer/sr-db'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { Card, CardContent, Container, Typography } from '@mui/material'
import { useContext } from 'react'

export default function Database() {
  const { database: mainDB } = useContext(DatabaseContext)
  return (
    <Container>
      <Card>
        <CardThemed bgt="dark">
          <CardContent>
            <Typography variant="h5">Database</Typography>
            <Typography>
              <pre>{JSON.stringify(mainDB.exportSROD(), undefined, 2)}</pre>
            </Typography>
          </CardContent>
        </CardThemed>
      </Card>
    </Container>
  )
}
