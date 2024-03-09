import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardActionArea,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import CharacterCardPico, {
  BlankCharacterCardPico,
} from '../Components/Character/CharacterCardPico'

// TODO: Translation

export default function TeamCard({
  teamId,
  onClick,
  bgt,
  disableButtons = false,
}: {
  teamId: string
  bgt?: 'light' | 'dark'
  onClick: (cid?: CharacterKey) => void
  disableButtons?: boolean
}) {
  const team = useTeam(teamId)!
  const { name, description, teamCharIds } = team
  const database = useDatabase()
  const onDel = () => {
    database.teams.remove(teamId)
  }
  const onExport = () => {
    const data = database.teams.export(teamId)
    const dataStr = JSON.stringify(data)
    navigator.clipboard
      .writeText(dataStr)
      .then(() => alert('Copied team data to clipboard.'))
      .catch(console.error)
  }
  const onDup = () => database.teams.duplicate(teamId)

  return (
    <CardThemed
      bgt={bgt}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: '100%',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography sx={{ display: 'flex', gap: 1 }}>
          <span>{name}</span>{' '}
          <BootstrapTooltip title={<Typography>{description}</Typography>}>
            <InfoIcon />
          </BootstrapTooltip>
        </Typography>

        <Box sx={{ marginTop: 'auto' }}>
          <Grid container columns={4} spacing={1}>
            {range(0, 3).map((i) => (
              <Grid key={i} item xs={1} height="100%">
                {teamCharIds[i] ? (
                  <CardActionArea
                    onClick={() =>
                      onClick(database.teamChars.get(teamCharIds[i])!.key)
                    }
                  >
                    <CharacterCardPico
                      characterKey={database.teamChars.get(teamCharIds[i])!.key}
                    />
                  </CardActionArea>
                ) : (
                  <CardActionArea onClick={() => onClick()}>
                    <BlankCharacterCardPico index={i} />
                  </CardActionArea>
                )}
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      {!disableButtons && (
        <Box sx={{ display: 'flex', gap: 1, marginTop: 'auto', p: 1 }}>
          <Button
            color="info"
            variant="text"
            sx={{ flexGrow: 1 }}
            startIcon={<ContentPasteIcon />}
            disabled={teamCharIds.every((id) => !id)}
            onClick={onExport}
          >
            Export
          </Button>
          <Divider orientation="vertical" />
          <IconButton
            color="info"
            disabled={teamCharIds.every((id) => !id)}
            onClick={onDup}
          >
            <ContentCopyIcon />
          </IconButton>
          <Divider orientation="vertical" />
          <IconButton color="error" size="small" onClick={onDel}>
            <DeleteForeverIcon />
          </IconButton>
        </Box>
      )}
    </CardThemed>
  )
}
