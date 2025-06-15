import { AnvilIcon } from '@genshin-optimizer/common/svgicons'
import { CardThemed, ImgIcon } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import {
  allArtifactSlotKeys,
  allElementKeys,
  allWeaponTypeKeys,
} from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getWeaponStat } from '@genshin-optimizer/gi/stats'
import {
  ElementIcon,
  FlowerIcon,
  SlotIcon,
} from '@genshin-optimizer/gi/svgicons'
import {
  BuildIcon,
  LoadoutIcon,
  TeamCardCompact,
  TeamIcon,
} from '@genshin-optimizer/gi/ui'
import { BusinessCenter, People } from '@mui/icons-material'

import {
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

export default function InventoryCard() {
  const { t } = useTranslation(['page_home', 'ui'])
  const navigate = useNavigate()
  const database = useDatabase()
  const { characterTally, characterTotal } = useMemo(() => {
    const chars = database.chars.keys
    const tally = objKeyMap(allElementKeys, () => 0)
    chars.forEach((ck) => {
      const elementKey = getCharEle(ck)
      tally[elementKey] = tally[elementKey] + 1
    })
    return { characterTally: tally, characterTotal: chars.length }
  }, [database])

  const { weaponTally, weaponTotal } = useMemo(() => {
    const weapons = database.weapons.values
    const tally = objKeyMap(allWeaponTypeKeys, () => 0)
    weapons.forEach((wp) => {
      const type = getWeaponStat(wp.key).weaponType
      tally[type] = tally[type] + 1
    })
    return { weaponTally: tally, weaponTotal: weapons.length }
  }, [database])

  const { artifactTally, artifactTotal } = useMemo(() => {
    const tally = objKeyMap(allArtifactSlotKeys, () => 0)
    const arts = database.arts.values
    arts.forEach((art) => {
      const slotKey = art.slotKey
      tally[slotKey] = tally[slotKey] + 1
    })
    return { artifactTally: tally, artifactTotal: arts.length }
  }, [database])

  const numTeams = database.teams.keys.length
  const numLoadout = database.teamChars.keys.length
  const numBuilds = database.builds.keys.length + database.buildTcs.keys.length
  const theme = useTheme()
  const smaller = !useMediaQuery(theme.breakpoints.up('md'))
  const latestBuilds = [...database.teams.entries]
    .sort((a, b) => {
      const [, ateam] = a
      const [, bteam] = b
      return bteam.lastEdit - ateam.lastEdit
    })
    .map(([teamId]) => teamId)
    .slice(0, 6)
  return (
    <CardThemed>
      <CardHeader
        title={<Typography variant="h5">{t('inventoryCard.title')}</Typography>}
        avatar={<BusinessCenter fontSize="large" />}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <CardThemed bgt="light">
          <CardActionArea
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              gap: 1,
              flexWrap: 'wrap',
            }}
            component={RouterLink}
            to="/characters"
          >
            <Chip
              label={
                <strong>
                  {t('ui:tabs.characters')} {characterTotal}
                </strong>
              }
              icon={<People />}
              sx={{
                flexBasis: smaller ? '100%' : 'auto',
                flexGrow: 1,
                cursor: 'pointer',
              }}
              color={characterTotal ? 'primary' : 'secondary'}
            />
            {Object.entries(characterTally).map(([ele, num]) => (
              <Chip
                key={ele}
                sx={{ flexGrow: 1, cursor: 'pointer' }}
                color={num ? ele : 'secondary'}
                icon={<ElementIcon ele={ele} />}
                label={<strong>{num}</strong>}
              />
            ))}
          </CardActionArea>
        </CardThemed>
        <CardThemed bgt="light">
          <CardActionArea
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              gap: 1,
              flexWrap: 'wrap',
            }}
            component={RouterLink}
            to="/weapons"
          >
            <Chip
              label={
                <strong>
                  {t('ui:tabs.weapons')} {weaponTotal}
                </strong>
              }
              icon={<AnvilIcon />}
              sx={{
                flexBasis: smaller ? '100%' : 'auto',
                flexGrow: 1,
                cursor: 'pointer',
              }}
              color={weaponTotal ? 'primary' : 'secondary'}
            />
            {Object.entries(weaponTally).map(([wt, num]) => (
              <Chip
                key={wt}
                sx={{ flexGrow: 1, cursor: 'pointer' }}
                color={num ? 'success' : 'secondary'}
                icon={<ImgIcon src={imgAssets.weaponTypes?.[wt]} size={2} />}
                label={<strong>{num}</strong>}
              />
            ))}
          </CardActionArea>
        </CardThemed>
        <CardThemed bgt="light">
          <CardActionArea
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              gap: 1,
              flexWrap: 'wrap',
            }}
            component={RouterLink}
            to="/artifacts"
          >
            <Chip
              label={
                <strong>
                  {t('ui:tabs.artifacts')} {artifactTotal}
                </strong>
              }
              icon={<FlowerIcon />}
              sx={{
                flexBasis: smaller ? '100%' : 'auto',
                flexGrow: 1,
                cursor: 'pointer',
              }}
              color={artifactTotal ? 'primary' : 'secondary'}
            />
            {Object.entries(artifactTally).map(([slotKey, num]) => (
              <Chip
                key={slotKey}
                sx={{ flexGrow: 1, cursor: 'pointer' }}
                color={num ? 'success' : 'secondary'}
                icon={<SlotIcon slotKey={slotKey} />}
                label={<strong>{num}</strong>}
              />
            ))}
          </CardActionArea>
        </CardThemed>
        <CardThemed bgt="light">
          <CardActionArea
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              p: 2,
              gap: 1,
              flexWrap: 'wrap',
            }}
            component={RouterLink}
            to="/teams"
          >
            <Chip
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              color={numTeams ? 'success' : 'secondary'}
              icon={<TeamIcon />}
              label={
                <strong>
                  {t('ui:tabs.teams')} {numTeams}
                </strong>
              }
            />
            <Chip
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              color={numLoadout ? 'success' : 'secondary'}
              icon={<LoadoutIcon />}
              label={
                <strong>
                  {t('ui:tabs.loadouts')} {numLoadout}
                </strong>
              }
            />
            <Chip
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              color={numBuilds ? 'success' : 'secondary'}
              icon={<BuildIcon />}
              label={
                <strong>
                  {t('ui:tabs.builds')} {numBuilds}
                </strong>
              }
            />
          </CardActionArea>
          <Grid
            container
            columns={{ xs: 1, sm: 2 }}
            sx={{ px: 1, pb: 1 }}
            spacing={1}
          >
            {latestBuilds.map((teamId) => (
              <Grid item key={teamId} xs={1}>
                <TeamCardCompact
                  teamId={teamId}
                  onClick={(ck) =>
                    navigate(ck ? `/teams/${teamId}/${ck}` : `/teams/${teamId}`)
                  }
                />
              </Grid>
            ))}
          </Grid>
        </CardThemed>
      </CardContent>
    </CardThemed>
  )
}
