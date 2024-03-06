import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  type ArtifactSlotKey,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardActionArea,
  Chip,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import Collapse from '@mui/material/Collapse'
import { useContext, useState } from 'react'
import ArtifactCardPico from '../Components/Artifact/ArtifactCardPico'
import CharacterCardPico, {
  BlankCharacterCardPico,
} from '../Components/Character/CharacterCardPico'
import WeaponCardPico from '../Components/Weapon/WeaponCardPico'
import { CharacterContext } from '../Context/CharacterContext'

// TODO: Translation

export default function TeamCard({
  teamId,
  onClick,
  bgt,
  disableButtons = false,
  showMore = false,
}: {
  teamId: string
  bgt?: 'light' | 'dark'
  onClick: (cid?: CharacterKey) => void
  disableButtons?: boolean
  showMore?: boolean
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
  const [expanded, setExpanded] = useState(false)
  const activeCharKey = useContext(CharacterContext).character?.key
  const activeCharId =
    !!activeCharKey &&
    teamCharIds
      .filter((cid) => !!cid)
      .find((cid) => database.teamChars.get(cid)?.key === activeCharKey)!
  const artifactSet =
    !!activeCharId && database.teamChars.getLoadoutArtifacts(activeCharId)
  const weapon =
    !!activeCharId && database.teamChars.getLoadoutWeapon(activeCharId)
  const artifacts:
    | false
    | Array<[ArtifactSlotKey, ICachedArtifact | undefined]> =
    !!artifactSet && allArtifactSlotKeys.map((k) => [k, artifactSet[k]])
  const buildId = !!activeCharId && database.teamChars.get(activeCharId)?.buildId
  const build = !!buildId && database.builds.get(buildId)

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
        <Typography sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <span>{name}</span>{' '}
          <BootstrapTooltip title={<Typography>{description}</Typography>}>
            <InfoIcon />
          </BootstrapTooltip>
          {showMore && (
            <IconButton
              onClick={() => setExpanded(!expanded)}
              sx={{
                marginLeft: 'auto',
                transform: !expanded ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )}
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
      {!!weapon && !!artifacts && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box p={1} paddingTop={0}>
            {build ? (
              <Typography
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  paddingBottom: 1,
                }}
              >
                <span>{build.name}</span>{' '}
                <BootstrapTooltip
                  title={<Typography>{build.description}</Typography>}
                >
                  <InfoIcon />
                </BootstrapTooltip>
              </Typography>
            ) : (
              <Divider orientation="horizontal" sx={{ paddingBottom: 1 }}>
                <Chip label="Default" size="small" />
              </Divider>
            )}
            <Grid container columns={3} spacing={1}>
              <Grid item xs={1} height="100%">
                <WeaponCardPico weaponId={weapon.id ?? ''} />
              </Grid>
              {artifacts.map(
                ([key, art]: [
                  ArtifactSlotKey,
                  ICachedArtifact | undefined
                ]) => (
                  <Grid item key={key} xs={1}>
                    <ArtifactCardPico artifactObj={art} slotKey={key} />
                  </Grid>
                )
              )}
            </Grid>
          </Box>
        </Collapse>
      )}
    </CardThemed>
  )
}
