import {
  CardHeaderCustom,
  CardThemed,
  ImgIcon,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import type { NodeDisplay } from '@genshin-optimizer/gi/uidata'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import { customRead } from '@genshin-optimizer/gi/wr'
import type { MasonryProps } from '@mui/lab'
import { Masonry } from '@mui/lab'
import { Box, Divider, ListItem } from '@mui/material'
import { useContext, useMemo } from 'react'
import { DataContext, OptimizationTargetContext } from '../../context'
import { getDisplayHeader, getDisplaySections } from '../../util'
import { FieldDisplayList, NodeFieldDisplay } from '../FieldDisplay'

export function StatDisplayComponent({
  columns = { xs: 1, sm: 2, md: 3, xl: 4 },
}: {
  columns?: MasonryProps['columns']
}) {
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
      <Masonry columns={columns} spacing={1}>
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
  const { data, compareData } = useContext(DataContext)
  const database = useDatabase()
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
  if (!header) return <CardThemed></CardThemed>

  const { title, icon, action } = header
  return (
    <CardThemed>
      <CardHeaderCustom
        avatar={icon && <ImgIcon size={2} src={icon} />}
        title={title}
        action={action && <SqBadge>{action}</SqBadge>}
      />
      <Divider />
      <FieldDisplayList sx={{ m: 0 }}>
        {Object.entries(displayNs).map(([nodeKey, n]) => (
          <NodeFieldDisplay
            key={nodeKey}
            node={n}
            compareValue={
              compareData
                ? compareData.get(displayNsReads[nodeKey]!).value
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
    </CardThemed>
  )
}
