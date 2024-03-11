import { BootstrapTooltip, CardThemed } from '@genshin-optimizer/common/ui'
import { hexToColor, range } from '@genshin-optimizer/common/util'
import type { CharacterKey, ElementKey } from '@genshin-optimizer/gi/consts'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import InfoIcon from '@mui/icons-material/Info'
import { Box, CardActionArea, Grid, Typography } from '@mui/material'
import CharacterCardPico, {
  BlankCharacterCardPico,
} from '../Components/Character/CharacterCardPico'
import { getCharSheet } from '../Data/Characters'

// TODO: Translation

export default function TeamCard({
  teamId,
  onClick,
  bgt,
}: {
  teamId: string
  bgt?: 'light' | 'dark'
  onClick: (cid?: CharacterKey) => void
}) {
  const team = useTeam(teamId)!
  const { name, description, teamCharIds } = team
  const database = useDatabase()

  const elementArray: Array<ElementKey | undefined> = teamCharIds.map(
    (tcid) => {
      if (!tcid) return
      const teamChar = database.teamChars.get(tcid)
      if (!teamChar) return
      return getCharSheet(teamChar.key).elementKey
    }
  )
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
        sx={(theme) => {
          const rgbas = elementArray.map((ele) => {
            if (!ele) return `rgba(0,0,0,0)`

            const hex = theme.palette[ele].main as string
            const color = hexToColor(hex)
            if (!color) return `rgba(0,0,0,0)`
            return `rgba(${color.r},${color.g},${color.b},0.25)`
          })
          return {
            // will be in the form of `linear-gradient(to right, red 12.5%, orange 27.5%, yellow 62.5%, green 87.5%)`
            background: `linear-gradient(to right, ${rgbas
              .map((rgba, i) => `${rgba} ${i * 25 + 12.5}%`)
              .join(', ')})`,
          }
        }}
      >
        <CardActionArea onClick={() => onClick()} sx={{ p: 1 }}>
          <Typography sx={{ display: 'flex', gap: 1 }}>
            <span>{name}</span>{' '}
            <BootstrapTooltip title={<Typography>{description}</Typography>}>
              <InfoIcon />
            </BootstrapTooltip>
          </Typography>
        </CardActionArea>

        <Box sx={{ p: 1 }}>
          <Grid container columns={4} spacing={1}>
            {range(0, 3).map((i) => (
              <Grid key={i} item xs={1} height="100%">
                {teamCharIds[i] ? (
                  <CardActionArea
                    onClick={() =>
                      onClick(database.teamChars.get(teamCharIds[i])?.key)
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
    </CardThemed>
  )
}
