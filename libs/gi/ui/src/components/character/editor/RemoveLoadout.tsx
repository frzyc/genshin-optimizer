import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import GroupsIcon from '@mui/icons-material/Groups'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'

export function RemoveLoadout({
  show,
  onHide,
  teamCharId,
  onDelete,
  teamIds,
  conditionalCount,
}: {
  show: boolean
  onHide: () => void
  teamCharId: string
  teamIds: string[]
  onDelete: () => void
  conditionalCount: number
}) {
  const database = useDatabase()
  const {
    name,
    description,
    buildIds,
    buildTcIds,
    customMultiTargets,
    bonusStats,
  } = database.teamChars.get(teamCharId)!

  const onDeleteLoadout = useCallback(() => {
    onHide()
    onDelete()
  }, [onDelete, onHide])
  return (
    <ModalWrapper
      open={show}
      onClose={onHide}
      containerProps={{ maxWidth: 'md' }}
    >
      <CardThemed>
        <CardHeader
          title={
            <span>
              Delete Loadout: <strong>{name}</strong>?
            </span>
          }
          action={
            <IconButton onClick={onHide}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          {description && (
            <CardThemed bgt="dark" sx={{ mb: 2 }}>
              <CardContent>{description}</CardContent>
            </CardThemed>
          )}
          <Typography>
            Deleting the Loadout will also delete the following data:
          </Typography>
          <List sx={{ listStyleType: 'disc', pl: 4 }}>
            {!!buildIds.length && (
              <ListItem sx={{ display: 'list-item' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All saved builds: {buildIds.length}{' '}
                  <Tooltip
                    title={
                      <Box>
                        {buildIds.map((bId) => (
                          <Typography
                            key={bId}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckroomIcon />
                            <span>{database.builds.get(bId)?.name}</span>
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                </Box>
              </ListItem>
            )}

            {!!buildTcIds.length && (
              <ListItem sx={{ display: 'list-item' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All saved TC builds: {buildTcIds.length}{' '}
                  <Tooltip
                    title={
                      <Box>
                        {buildTcIds.map((bId) => (
                          <Typography
                            key={bId}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <CheckroomIcon />
                            <span>{database.buildTcs.get(bId)?.name}</span>
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                </Box>
              </ListItem>
            )}

            {!!customMultiTargets.length && (
              <ListItem sx={{ display: 'list-item' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  All Custom Multi-targets: {customMultiTargets.length}{' '}
                  <Tooltip
                    title={
                      <Box>
                        {customMultiTargets.map((target, i) => (
                          <Typography
                            key={i}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <DashboardCustomizeIcon />
                            <span>{target.name}</span>
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                </Box>
              </ListItem>
            )}

            {!!Object.keys(bonusStats).length && (
              <ListItem sx={{ display: 'list-item' }}>
                Bonus stats: {Object.keys(bonusStats).length}
              </ListItem>
            )}
            {!!conditionalCount && (
              <ListItem sx={{ display: 'list-item' }}>
                Conditionals: {conditionalCount}
              </ListItem>
            )}
            <ListItem sx={{ display: 'list-item' }}>
              Optimization Configuration
            </ListItem>

            {!!teamIds.length && (
              <ListItem sx={{ display: 'list-item' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>
                    Any teams with this loadout will have this loadout removed
                    from the team. Teams will not be deleted. Teams affected:{' '}
                    {teamIds.length}
                  </span>

                  <Tooltip
                    title={
                      <Box>
                        {teamIds.map((teamId) => (
                          <Typography
                            key={teamId}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <GroupsIcon />
                            <span>{database.teams.get(teamId)?.name}</span>
                          </Typography>
                        ))}
                      </Box>
                    }
                  >
                    <InfoIcon />
                  </Tooltip>
                </Box>
              </ListItem>
            )}
          </List>
        </CardContent>
        <CardActions sx={{ float: 'right' }}>
          <Button startIcon={<CloseIcon />} color="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button
            startIcon={<DeleteForeverIcon />}
            color="error"
            onClick={onDeleteLoadout}
          >
            Delete
          </Button>
        </CardActions>
      </CardThemed>
    </ModalWrapper>
  )
}
