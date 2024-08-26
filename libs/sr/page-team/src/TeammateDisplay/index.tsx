import { CardThemed } from '@genshin-optimizer/common/ui'
import { MemberContext } from '@genshin-optimizer/pando/ui-sheet'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { convert, members, selfTag } from '@genshin-optimizer/sr/formula'
import { useSrCalcContext } from '@genshin-optimizer/sr/formula-ui'
import {
  CharacterCard,
  CharacterEditor,
  useCharacterContext,
  useDatabaseContext,
  useLoadoutContext,
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
import Optimize from './Tabs/Optimize'
import CharacterTalentPane from './Tabs/TalentContent'

export default function TeammateDisplay({ tab }: { tab?: string }) {
  const {
    team,
    loadout: { key: characterKey },
  } = useLoadoutContext()
  const { database } = useDatabaseContext()
  const { character } = useCharacterContext()
  const calc = useSrCalcContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )

  const teammateIndex = team.loadoutMetadata.findIndex(
    (meta) => database.loadouts.get(meta?.loadoutId)?.key === characterKey
  )

  const member = convert(selfTag, {
    et: 'self',
    src: members[teammateIndex],
  })
  return (
    <MemberContext.Provider value={member}>
      <Box>
        {tab}
        <CharacterEditor
          characterKey={editorKey}
          onClose={() => setCharacterKey(undefined)}
        />
        <CharacterCard character={character!} />
        <Stack gap={1} pt={1}>
          <CardThemed bgt="dark">
            <CardContent>
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
                      ?.listFormulas(member.listing.formulas)
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
          <CharacterTalentPane />
          {/* TODO: Move to a dedicated tab */}
          <Optimize />
        </Stack>
      </Box>
    </MemberContext.Provider>
  )
}
