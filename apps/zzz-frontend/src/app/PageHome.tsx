import { CardThemed } from '@genshin-optimizer/common/ui'
import { Box, CardContent, Typography } from '@mui/material'

export default function PageHome() {
  return (
    <CardThemed sx={{ my: 1 }}>
      <CardContent>
        <Typography variant="h5">I know what this looks like...</Typography>
        <Typography>
          This is an <i>Alpha</i>(desperately unfinished) version of{' '}
          <strong>Zenless Optimizer</strong>. You have to understand, this is
          the result of asking,
        </Typography>
        <Typography variant="caption">
          "What is the most Optimizer I can, if I was cutting corners like it's
          crunch time at a circle factory?" — frzyc, probably
        </Typography>
        <Typography>
          I know a lot of stuff isn't implemented, and the stuff that are, are
          super ugly. This is only like{' '}
          <Box component="span" sx={{ textDecoration: 'line-through' }}>
            10
          </Box>{' '}
          20 hours of coding, cut me some slack.
        </Typography>
        <Typography sx={{ my: 1 }}>Have an optimal day,</Typography>
        <Typography>
          <strong>frzyc</strong>
        </Typography>
      </CardContent>
    </CardThemed>
  )
}
