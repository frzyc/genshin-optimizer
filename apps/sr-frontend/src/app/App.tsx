import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material'
import React from 'react'
import { theme } from './Theme'
import Character from './Character'
export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Character />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
