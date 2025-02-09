import {
  CardThemed,
  CodeBlock,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { DebugMeta } from '@genshin-optimizer/pando/engine'
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
import { useContext } from 'react'
import { CalcContext, DebugReadContext, TagContext } from './context'
import type { FilterFunc, GenericRead } from './types'

export function DebugListingsDisplay({
  formulasRead,
  buffsRead,
  filterFunc,
}: {
  formulasRead: GenericRead
  buffsRead: GenericRead
  filterFunc: FilterFunc
}) {
  const tag = useContext(TagContext)
  const calc = useContext(CalcContext)?.withTag(tag)
  return (
    <CardThemed bgt="dark">
      <CardContent>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            All target listings
          </AccordionSummary>
          <AccordionDetails>
            <Stack>
              {calc?.listFormulas(formulasRead).map((read, index) => {
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
                        conds:
                        <CodeBlock
                          text={JSON.stringify(
                            computed.meta.conds,
                            undefined,
                            2
                          )}
                        />
                        read:
                        <CodeBlock text={JSON.stringify(read, undefined, 2)} />
                        formula:
                        <CodeBlock
                          text={JSON.stringify(
                            filterDebug(
                              calc.toDebug().compute(read).meta,
                              filterFunc
                            ),
                            undefined,
                            2
                          )}
                        />
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
              {calc?.listFormulas(buffsRead).map((read, index) => {
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
                        conds:
                        <CodeBlock
                          text={JSON.stringify(
                            computed.meta.conds,
                            undefined,
                            2
                          )}
                        />
                        read:
                        <CodeBlock text={JSON.stringify(read, undefined, 2)} />
                        formula:
                        <CodeBlock
                          text={JSON.stringify(
                            filterDebug(
                              calc.toDebug().compute(read).meta,
                              filterFunc
                            ),
                            undefined,
                            2
                          )}
                        />
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

export function DebugReadModal({ filterFunc }: { filterFunc: FilterFunc }) {
  const tag = useContext(TagContext)
  const calculator = useContext(CalcContext)?.withTag(tag)
  const { read, setRead } = useContext(DebugReadContext)
  const computed = read && calculator?.compute(read)
  const debug = read && calculator?.toDebug().compute(read)
  const name = read?.tag['name'] || read?.tag['q']
  const meta = debug?.meta
  const jsonStr =
    meta && JSON.stringify(filterDebug(meta, filterFunc), undefined, 2)

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
                <CodeBlock text={JSON.stringify(read, undefined, 2)} />
                <Divider />
                <Typography variant="h6">Calculator Tag</Typography>
                <CodeBlock text={JSON.stringify(calculator?.cache.tag)} />
                <Divider />
                <Typography variant="h6">Tag Context</Typography>
                <CodeBlock text={JSON.stringify(tag)} />
                <Divider />
                <Typography variant="h6">Conditionals</Typography>
                <CodeBlock
                  text={JSON.stringify(computed?.meta.conds, undefined, 2)}
                />
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

function filterDebug(debug: DebugMeta, filterFunc: FilterFunc) {
  for (let i = debug.deps.length - 1; i >= 0; i--) {
    if (filterFunc(debug.deps[i])) {
      debug.deps.splice(i, 1)
      continue
    }
    debug.deps[i] = filterDebug(debug.deps[i], filterFunc)
  }
  return debug
}
