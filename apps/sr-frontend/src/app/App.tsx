import {
  CharacterProvider,
  DatabaseProvider,
} from '@genshin-optimizer/sr-context'
import {
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import Character from './Character'
import Database from './Database'
import { theme } from './Theme'

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <DatabaseProvider>
          <CharacterProvider>
            <CssBaseline />
            <Stack gap={1} pt={1}>
              <Character />
              <Database />
            </Stack>
          </CharacterProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
