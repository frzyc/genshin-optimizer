import { objMap } from '@genshin-optimizer/util'
import { Masonry } from '@mui/lab'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ListItem,
  Typography,
} from '@mui/material'
import { useContext, useMemo } from 'react'
import { DataContext } from '../../Context/DataContext'
import { OptimizationTargetContext } from '../../Context/OptimizationTargetContext'
import { DatabaseContext } from '../../Database/Database'
import { getDisplayHeader, getDisplaySections } from '../../Formula/DisplayUtil'
import type { DisplaySub } from '../../Formula/type'
import type { NodeDisplay } from '../../Formula/uiData'
import { customRead } from '../../Formula/utils'
import CardDark from '../Card/CardDark'
import { FieldDisplayList, NodeFieldDisplay } from '../FieldDisplay'
import ImgIcon from '../Image/ImgIcon'
import SqBadge from '../SqBadge'
export default function StatDisplayComponent() {
  const { data } = useContext(DataContext)
  const sections = useMemo(
    () =>
      getDisplaySections(data).filter(([, ns]) =>
        Object.values(ns).some((n) => !n.isEmpty)
      ),
    [data]
  )
  return (
    <Box sx={{ mr: -1, mb: -1 }}>
      <Masonry columns={{ xs: 1, sm: 2, md: 3, xl: 4 }} spacing={1}>
        {sections.map(([key, Nodes]) => (
          <Section key={key} displayNs={Nodes} sectionKey={key} />
        ))}
      </Masonry>
    </Box>
  )
}

function Section({
  displayNs,
  sectionKey,
}: {
  displayNs: DisplaySub<NodeDisplay>
  sectionKey: string
}) {
  const optimizationTarget = useContext(OptimizationTargetContext)
  const { data, oldData } = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const header = useMemo(
    () => getDisplayHeader(data, sectionKey, database),
    [database, data, sectionKey]
  )
  const displayNsReads = useMemo(
    () =>
      objMap(displayNs, (n, nodeKey) =>
        customRead(['display', sectionKey, nodeKey])
      ),
    [displayNs, sectionKey]
  )
  if (!header) return <CardDark></CardDark>

  const { title, icon, action } = header
  return (
    <CardDark>
      <Accordion
        sx={(theme) => ({ bgcolor: theme.palette.contentNormal.main })}
      >
        <HeaderContent
          avatar={icon && <ImgIcon size={2} src={icon} />}
          title={title}
          action={action && <SqBadge>{action}</SqBadge>}
        />
        {/* TEST
      <Divider /> */}
        <AccordionDetails sx={{ p: 0 }}>
          <FieldDisplayList sx={{ m: 0 }}>
            {Object.entries(displayNs).map(([nodeKey, n]) => (
              <NodeFieldDisplay
                key={nodeKey}
                node={n}
                oldValue={
                  oldData
                    ? oldData.get(displayNsReads[nodeKey]!).value
                    : undefined
                }
                component={ListItem}
                emphasize={
                  JSON.stringify(optimizationTarget) ===
                  JSON.stringify([sectionKey, nodeKey])
                }
              />
            ))}
          </FieldDisplayList>
        </AccordionDetails>
      </Accordion>
    </CardDark>
  )
}

export function HeaderContent({
  avatar,
  title,
  action,
}: {
  avatar?: Displayable
  title: Displayable
  action?: Displayable
}) {
  return (
    <AccordionSummary>
      <Box display="flex" gap={1} alignItems="center">
        {avatar}
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {action && <Typography variant="caption">{action}</Typography>}
      </Box>
    </AccordionSummary>
  )
}
