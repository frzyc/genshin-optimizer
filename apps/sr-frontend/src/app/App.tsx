import {
  CalcProvider,
  CharacterProvider,
  DatabaseProvider,
  LightConeInventory,
  LightConeEditor,
  RelicEditor,
} from '@genshin-optimizer/sr/ui'
import { ExpandMore } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
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
                <Container>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      Light Cones
                    </AccordionSummary>
                    <AccordionDetails>
                      <LightConeInventory />
                    </AccordionDetails>
                  </Accordion>
                </Container>
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
