import {
  CalcProvider,
  CharacterProvider,
  DatabaseProvider,
  LightConeEditor,
  RelicEditor,
} from '@genshin-optimizer/sr/ui'
import {
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
} from '@mui/material'
import Character from './Character'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Optimize from './Optimize'
import { theme } from './Theme'

export default function App() {
  return (
    <StyledEngineProvider injectFirst>
      {/* https://mui.com/guides/interoperability/#css-injection-order-2 */}
      <ThemeProvider theme={theme}>
        <DatabaseProvider>
          <CharacterProvider>
            <CalcProvider>
              <CssBaseline />
              <Stack gap={1} pt={1}>
                <CharacterSelector />
                <Character />
                <LightConeEditor />
                <RelicEditor />
                <Optimize />
                <Database />
              </Stack>
            </CalcProvider>
          </CharacterProvider>
        </DatabaseProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
