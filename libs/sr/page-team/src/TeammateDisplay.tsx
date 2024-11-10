import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import {
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/db-ui'
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
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { BuildsDisplay, EquipRow } from './BuildsDisplay'
import { ComboEditor } from './ComboEditor'
import { useTeamContext } from './context'
import Optimize from './Optimize'
import CharacterTalentPane from './TalentContent'

export default function TeammateDisplay() {
  const {
    teammateDatum: { characterKey },
  } = useTeamContext()
  const character = useCharacterContext()
  const [editorKey, setCharacterKey] = useState<CharacterKey | undefined>(
    undefined
  )

  return (
    <Stack gap={1}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ minWidth: '350px' }}>
          <CharacterCard character={character!} />
          <CharacterEditor
            characterKey={editorKey}
            onClose={() => setCharacterKey(undefined)}
          />
          <Button
            fullWidth
            disabled={!characterKey}
            onClick={() => characterKey && setCharacterKey(characterKey)}
          >
            Edit Character
          </Button>
        </Box>
        <CurrentBuildDisplay />
      </Box>
      <ComboEditor />
      <CalcDebug />
      <CharacterTalentPane />
      <Optimize />
    </Stack>
  )
}
function CurrentBuildDisplay() {
  const { teammateDatum } = useTeamContext()
  const { database } = useDatabaseContext()
  const { buildName, relicIds, lightConeId } = useMemo(
    () => ({
      buildName: database.teams.getActiveBuildName(teammateDatum),
      ...database.teams.getTeamActiveBuild(teammateDatum),
    }),
    [database.teams, teammateDatum]
  )
  const [show, onShow, onHide] = useBoolState()
  return (
    <CardThemed sx={{ width: '100%' }}>
      <BuildsModal show={show} onClose={onHide} />
      <CardHeader
        title={buildName}
        action={
          // TODO: translation
          <Button onClick={onShow} size="small">
            Change Build
          </Button>
        }
      />
      <Divider />
      <CardContent>
        <EquipRow relicIds={relicIds} lightConeId={lightConeId} />
      </CardContent>
    </CardThemed>
  )
}
function BuildsModal({
  show,
  onClose,
}: {
  show: boolean
  onClose: () => void
}) {
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <BuildsDisplay onClose={onClose} />
    </ModalWrapper>
  )
}

function CalcDebug() {
  const calc = useSrCalcContext()
  return (
    <CardThemed bgt="dark">
      <CardContent>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            All target listings
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              {calc?.listFormulas(own.listing.formulas).map((read, index) => {
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
  )
}
