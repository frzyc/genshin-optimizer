import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import { input } from '@genshin-optimizer/gi/wr'
import { ListItem, Typography } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../../../context'
import { resolveInfo } from '../../../util'
import { FieldDisplayList, NodeFieldDisplay } from '../../FieldDisplay'

export function CharacterCardStats({ bgt }: { bgt?: CardBackgroundColor }) {
  const { data } = useContext(DataContext)
  const specialNode = data.get(input.special)
  const { name, icon } = resolveInfo(specialNode.info)
  return (
    <FieldDisplayList bgt={bgt} sx={{ width: '100%', borderRadius: 0 }}>
      {Object.values(data.getDisplay()['basic']).map((n) => (
        <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
      ))}
      {name && (
        <ListItem sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography flexGrow={1}>
            <strong>Specialized:</strong>
          </Typography>
          {icon}
          <Typography>{name}</Typography>
        </ListItem>
      )}
    </FieldDisplayList>
  )
}
