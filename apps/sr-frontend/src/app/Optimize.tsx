import { convert, selfTag } from '@genshin-optimizer/sr-formula'
import { useCalcContext } from '@genshin-optimizer/sr-ui'
import { CardThemed } from '@genshin-optimizer/ui-common'
import { CardContent, Container, Typography } from '@mui/material'

export default function Optimize() {
  const { calc } = useCalcContext()
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <Typography variant="h5">Optimize</Typography>
          {JSON.stringify(calc?.listFormulas(member0.listing.formulas))}
        </CardContent>
      </CardThemed>
    </Container>
  )
}
