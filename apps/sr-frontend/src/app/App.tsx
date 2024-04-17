import {
  CalcProvider,
  CharacterInventory,
  CharacterProvider,
  DatabaseProvider,
  LightConeEditor,
  RelicEditor,
} from '@genshin-optimizer/sr/ui'
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
import CharacterEditor from './Character'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Optimize from './Optimize'
import { theme } from './Theme'
import { ExpandMore } from '@mui/icons-material'
import Character from './Character'

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
                      Characters
                    </AccordionSummary>
                    <AccordionDetails>
                      <CharacterInventory />
                    </AccordionDetails>
                  </Accordion>
                </Container>
                <CharacterEditor />
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
