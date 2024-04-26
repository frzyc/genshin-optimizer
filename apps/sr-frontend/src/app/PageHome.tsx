import { CharacterInventory, RelicEditor, RelicInventory } from '@genshin-optimizer/sr/ui'
import { Accordion, AccordionDetails, AccordionSummary, Container, Stack } from '@mui/material'
import CharacterEditor from './Character'
import CharacterSelector from './CharacterSelector'
import Database from './Database'
import Optimize from './Optimize'
import { ExpandMore } from '@mui/icons-material'

// TODO: Move this to a lib once the components below are moved.
export default function PageHome() {
  return (
    <Stack gap={1} pt={1}>
      <CharacterSelector />
      <CharacterEditor />
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
      <RelicEditor />
      <RelicInventory />
      <Optimize />
      <Database />
    </Stack>
  )
}
