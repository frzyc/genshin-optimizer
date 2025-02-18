import {
  CardThemed,
  CodeBlock,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { prettify } from '@genshin-optimizer/common/util'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { Box, Stack } from '@mui/system'
import type { SyntheticEvent } from 'react'
import { useContext, useState } from 'react'
import { CalcContext, DebugReadContext, TagContext } from './context'
import type { GenericRead } from './types'

export function DebugListingsDisplay({
  formulasRead,
  buffsRead,
}: {
  formulasRead: GenericRead
  buffsRead: GenericRead
}) {
  const tag = useContext(TagContext)
  const calc = useContext(CalcContext)?.withTag(tag)
  const debugCalc = calc?.toDebug()

  const [expanded, setExpanded] = useState<string | false>(false)
  const handleChange =
    (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  return (
    <CardThemed bgt="dark">
      <CardContent>
        <Accordion
          expanded={expanded === 'formulas'}
          onChange={handleChange('formulas')}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            All target listings
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              {calc &&
                debugCalc &&
                expanded === 'formulas' &&
                calc.listFormulas(formulasRead).map((read, index) => {
                  const computed = calc.compute(read)
                  const debugMeta = debugCalc.compute(read).meta
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
                          conds:
                          <CodeBlock text={prettify(computed.meta.conds)} />
                          read:
                          <CodeBlock text={prettify(read)} />
                          formula:
                          <CodeBlock text={prettify(debugMeta)} />
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  )
                })}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'buffs'}
          onChange={handleChange('buffs')}
          slotProps={{ transition: { unmountOnExit: true } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            All target buffs
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              {calc &&
                debugCalc &&
                expanded === 'buffs' &&
                calc.listFormulas(buffsRead).map((read, index) => {
                  const computed = calc.compute(read)
                  const debugMeta = debugCalc.compute(read).meta
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
                          conds:
                          <CodeBlock text={prettify(computed.meta.conds)} />
                          read:
                          <CodeBlock text={prettify(read)} />
                          formula:
                          <CodeBlock text={prettify(debugMeta)} />
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

export function DebugReadModal() {
  const tag = useContext(TagContext)
  const calculator = useContext(CalcContext)?.withTag(tag)
  const debugCalc = calculator?.toDebug()
  const { read, setRead } = useContext(DebugReadContext)
  const computed = read && calculator?.compute(read)
  const debug = read && debugCalc?.compute(read)
  const name = read?.tag['name'] || read?.tag['q']
  const meta = debug?.meta
  const jsonStr = meta && prettify(meta)

  return (
    <ModalWrapper open={!!read} onClose={() => setRead(undefined)}>
      <CardThemed bgt="dark">
        <CardHeader
          title={`Debug formula for ${name}`}
          action={
            <IconButton onClick={() => setRead(undefined)}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent>
          <CardThemed bgt="normal">
            <CardContent>
              <Stack gap={1}>
                Computed value: {computed?.val}
                <Divider />
                <Typography variant="h6">Read</Typography>
                <CodeBlock text={prettify(read)} />
                <Divider />
                <Typography variant="h6">Calculator Tag</Typography>
                <CodeBlock text={JSON.stringify(calculator?.cache.tag)} />
                <Divider />
                <Typography variant="h6">Tag Context</Typography>
                <CodeBlock text={JSON.stringify(tag)} />
                <Divider />
                <Typography variant="h6">Conditionals</Typography>
                <CodeBlock text={prettify(computed?.meta.conds)} />
                <Divider />
                <Typography variant="h6">Formula</Typography>
                <CodeBlock text={jsonStr || ''} />
              </Stack>
            </CardContent>
          </CardThemed>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
