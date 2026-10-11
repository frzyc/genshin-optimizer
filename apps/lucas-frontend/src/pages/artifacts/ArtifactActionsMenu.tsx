import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import DifferenceIcon from '@mui/icons-material/Difference'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

/** Bulk actions over the filtered artifacts (upstream ArtifactRedButtons) plus the duplicates tool. */
export function ArtifactActionsMenu({
  artifactIds,
  onShowDup,
}: {
  artifactIds: string[]
  onShowDup: () => void
}) {
  const database = useDatabase()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)

  const { numDelete, numUnequip, numUnlock, numLock } = useMemo(() => {
    const artifacts = artifactIds.map((id) =>
      database.arts.get(id)
    ) as ICachedArtifact[]
    const numUnlock = artifacts.reduce((a, art) => a + (art.lock ? 0 : 1), 0)
    const numLock = artifacts.length - numUnlock
    const numUnequip = artifacts.reduce(
      (a, art) => a + (art.location ? 1 : 0),
      0
    )
    return { numDelete: numUnlock, numUnequip, numUnlock, numLock }
  }, [artifactIds, database])

  const run = (confirmText: string, action: () => void) => () => {
    close()
    if (window.confirm(confirmText)) action()
  }
  const actions: Array<{
    label: string
    count: number
    icon: ReactNode
    onClick: () => void
  }> = [
    {
      label: 'Desequipar',
      count: numUnequip,
      icon: <PersonOffIcon fontSize="small" />,
      onClick: run(
        `Desequipar ${numUnequip} artefatos dos personagens?`,
        () => artifactIds.forEach((id) => database.arts.set(id, { location: '' }))
      ),
    },
    {
      label: 'Excluir destrancados',
      count: numDelete,
      icon: <DeleteForeverIcon fontSize="small" />,
      onClick: run(`Excluir ${numDelete} artefatos destrancados?`, () =>
        artifactIds.forEach(
          (id) => !database.arts.get(id)?.lock && database.arts.remove(id)
        )
      ),
    },
    {
      label: 'Destrancar',
      count: numLock,
      icon: <LockOpenIcon fontSize="small" />,
      onClick: run(`Destrancar ${numLock} artefatos?`, () =>
        artifactIds.forEach((id) => database.arts.set(id, { lock: false }))
      ),
    },
    {
      label: 'Trancar',
      count: numUnlock,
      icon: <LockIcon fontSize="small" />,
      onClick: run(`Trancar ${numUnlock} artefatos?`, () =>
        artifactIds.forEach((id) => database.arts.set(id, { lock: true }))
      ),
    },
  ]

  return (
    <>
      <Button
        color="secondary"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        Ações
      </Button>
      <Menu
        open={!!anchor}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            close()
            onShowDup()
          }}
        >
          <ListItemIcon>
            <DifferenceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mostrar duplicatas</ListItemText>
        </MenuItem>
        <Divider />
        <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px' }}>
          Nos {artifactIds.length} artefatos filtrados
        </ListSubheader>
        {actions.map(({ label, count, icon, onClick }) => (
          <MenuItem key={label} disabled={!count} onClick={onClick}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText>{label}</ListItemText>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {count}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
