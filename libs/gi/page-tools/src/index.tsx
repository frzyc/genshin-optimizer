import { Box } from '@mui/material'
import ReactGA from 'react-ga4'
import EXPCalc from './EXPCalc'
import ResinCounter from './ResinCounter'
import TeyvatTime from './TeyvatTime'

export default function PageTools() {
  ReactGA.send({ hitType: 'pageview', page: '/tools' })
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <TeyvatTime />
      <ResinCounter />
      <EXPCalc />
    </Box>
  )
}
