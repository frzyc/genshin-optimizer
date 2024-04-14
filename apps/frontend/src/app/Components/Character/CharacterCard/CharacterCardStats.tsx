import { Box, Typography } from '@mui/material'
import { useContext } from 'react'
import { DataContext } from '../../../Context/DataContext'
import { input } from '../../../Formula'
import { NodeFieldDisplay } from '../../FieldDisplay'

export function CharacterCardStats() {
  const { data } = useContext(DataContext)
  return (
    <Box sx={{ width: '100%' }}>
      {Object.values(data.getDisplay().basic).map((n) => (
        <NodeFieldDisplay key={JSON.stringify(n.info)} node={n} />
      ))}
      {data.get(input.special).info.name && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography flexGrow={1}>
            <strong>Specialized:</strong>
          </Typography>
          {data.get(input.special).info.icon}
          <Typography>{data.get(input.special).info.name}</Typography>
        </Box>
      )}
    </Box>
  )
}
