import { resolveInfo } from '@genshin-optimizer/gi/uidata'
import { input } from '@genshin-optimizer/gi/wr'
import { Box, Typography } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../../../context'
import { NodeFieldDisplay } from '../../FieldDisplay'

export function CharacterCardStats() {
  const { data } = useContext(DataContext)
  const specialNode = data.get(input.special)
  const { name, icon } = resolveInfo(specialNode.info)
  return (
    <Box sx={{ width: '100%' }}>
      {Object.values(data.getDisplay().basic).map((n) => (
        <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
      ))}
      {name && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography flexGrow={1}>
            <strong>Specialized:</strong>
          </Typography>
          {icon}
          <Typography>{name}</Typography>
        </Box>
      )}
    </Box>
  )
}
