import {
  CalcProvider,
  CharacterProvider,
  DatabaseProvider,
  LightConeInventory,
  RelicEditor,
} from '@genshin-optimizer/sr/ui'
import {
  CssBaseline,
  Stack,
  StyledEngineProvider,
  ThemeProvider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import Character from './Character'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Optimize from './Optimize'
import { theme } from './Theme'
import { ExpandMore } from '@mui/icons-material'

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
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    Light Cones
                  </AccordionSummary>
                  <AccordionDetails>
                    <LightConeInventory />
                  </AccordionDetails>
                </Accordion>
                {/* <Accordion>
                  <LightConeInventory />
                </Accordion> */}
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
