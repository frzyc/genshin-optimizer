import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { useCharacterContext } from '@genshin-optimizer/sr/db-ui'
import { own } from '@genshin-optimizer/sr/formula'
import {
  CharacterCard,
  CharacterEditor,
  useSrCalcContext,
} from '@genshin-optimizer/sr/ui'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { BonusStats } from '../BonusStats'
import { ComboEditor } from '../ComboEditor'
import { useTeamContext } from '../context'
import CharacterTalentPane from '../TalentContent'
import Optimize from './Optimize'

export default function TeammateDisplay() {
  const {
    teamMetadatum: { characterKey },
  } = useTeamContext()
  const character = useCharacterContext()
  const calc = useSrCalcContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )

  return (
    <Box>
      <CharacterEditor
        characterKey={editorKey}
        onClose={() => setCharacterKey(undefined)}
      />
      <CharacterCard character={character!} />
      <Stack gap={1} pt={1}>
        <ComboEditor />
        <CardThemed bgt="dark">
          <CardContent>
            <Button
              disabled={!characterKey}
              onClick={() => characterKey && setCharacterKey(characterKey)}
            >
              Edit Character
            </Button>
            <BonusStats />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                All target listings
              </AccordionSummary>
              <AccordionDetails>
                <Stack>
                  {calc
                    ?.listFormulas(own.listing.formulas)
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
                              conds:{' '}
                              {JSON.stringify(
                                computed.meta.conds,
                                undefined,
                                2
                              )}
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
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                All target buffs
              </AccordionSummary>
              <AccordionDetails>
                <Stack>
                  {calc?.listFormulas(own.listing.buffs).map((read, index) => {
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
                            conds:{' '}
                            {JSON.stringify(computed.meta.conds, undefined, 2)}
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
        <CharacterTalentPane />
        <Optimize />
      </Stack>
    </Box>
  )
}
