import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import { Box, Button, CardActionArea, Grid, Typography } from '@mui/material'
import CharacterCardPico, {
  BlankCharacterCardPico,
} from '../Components/Character/CharacterCardPico'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
export default function TeamCard({
  teamId,
  onClick,
}: {
  teamId: string
  onClick: () => void
}) {
  const team = useTeam(teamId)
  const { name, description, teamCharIds } = team
  const database = useDatabase()
  const onDel = () => {
    // TODO: prompt for deletion
    database.teams.remove(teamId)
  }
  return (
    <CardThemed
      sx={{
        height: '100%',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          alignItems: 'stretch',
        }}
      >
        <BootstrapTooltip title={<Typography>{description}</Typography>}>
          <Typography sx={{ display: 'flex', gap: 1 }}>
            <span>{name}</span> <InfoIcon />
          </Typography>
        </BootstrapTooltip>
        <Box>
          <Grid container columns={4} spacing={1}>
            {range(0, 3).map((i) => (
              <Grid key={i} item xs={1} height="100%">
                {teamCharIds[i] ? (
                  <CharacterCardPico
                    characterKey={database.teamChars.get(teamCharIds[i]).key}
                  />
                ) : (
                  <BlankCharacterCardPico index={i} />
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardActionArea>
      <Box sx={{ display: 'flex', gap: 1, marginTop: 'auto' }}>
        <Button
          color="info"
          sx={{ flexGrow: 1 }}
          startIcon={<ContentPasteIcon />}
        >
          Export
        </Button>
        <Button color="error" size="small" onClick={onDel}>
          <DeleteForeverIcon />
        </Button>
      </Box>
    </CardThemed>
  )
}
