import { Box } from '@mui/material';
import React from 'react';
import ReactGA from 'react-ga4';
import EXPCalc from './EXPCalc';
import ResinCounter from './ResinCounter';
import TeyvatTime from './TeyvatTime';

export default function PageTools(props) {
  ReactGA.send({ hitType: "pageview", page: '/tools' })
  return <Box display="flex" flexDirection="column" gap={1} my={1}>
    <TeyvatTime />
    <ResinCounter />
    <EXPCalc />
  </Box>
}
