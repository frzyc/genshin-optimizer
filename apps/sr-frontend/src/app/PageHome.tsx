import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import {
  CharacterEditor,
  useCalcContext,
  useCharacterContext,
} from '@genshin-optimizer/sr/ui'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import CharacterSelector from './CharacterSelector'
import Optimize from './Optimize'

// TODO: Move this to a lib once the components below are moved.
export default function PageHome() {
  const { characterKey } = useCharacterContext()
  const { calc } = useCalcContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )
  const member0 = convert(selfTag, { et: 'self', src: '0', dst: 'all' })

  return (
    <>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <Stack gap={1} pt={1}>
        <Container>
          <CardThemed bgt="dark">
            <CardContent>
              <CharacterSelector />
              <Button
                disabled={!characterKey}
                onClick={() => characterKey && setCharacterKey(characterKey)}
              >
                Edit Character
              </Button>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  All target values, if sheet is created
                </AccordionSummary>
                <AccordionDetails>
                  <Stack>
                    {calc
                      ?.listFormulas(member0.listing.formulas)
                      .map((read, index) => {
                        const computed = calc.compute(read)
                        const name = read.tag.name || read.tag.q
                        return (
                          <Box key={`${name}${index}`}>
                            <Typography>
                              {name}: {computed.val}
                            </Typography>
                            <Accordion>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                debug for {name}
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography component="pre">
                                  {JSON.stringify(
                                    calc.toDebug().compute(read),
                                    undefined,
                                    2
                                  )}
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          </Box>
                        )
                      })}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </CardThemed>
        </Container>
        <Optimize />
      </Stack>
    </>
  )
}
