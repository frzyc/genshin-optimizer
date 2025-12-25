import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { CardThemed, ColorText, StatInput } from '@genshin-optimizer/common/ui'
import type { ElementWithPhyKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type { Team } from '@genshin-optimizer/gi/db'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import type { EleEnemyResKey } from '@genshin-optimizer/gi/keymap'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import type { IconButtonProps } from '@mui/material'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Chip,
  Collapse,
  Grid,
  IconButton,
  Typography,
  styled,
} from '@mui/material'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}
const ExpandButton = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: (theme as any).transitions.create('transform', {
    duration: (theme as any).transitions.duration.shortest,
  }),
}))

export default ExpandButton
export function EnemyExpandCard({ teamId }: { teamId: string }) {
  const { t } = useTranslation('page_team')
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(
    () => setexpanded(!expanded),
    [setexpanded, expanded]
  )
  const {
    enemyOverride,
    enemyOverride: { enemyLevel, enemyDefRed_, enemyDefIgn_ },
  } = useTeam(teamId)!

  return (
    <CardThemed bgt="light">
      <CardActionArea onClick={toggle}>
        <CardContent
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Chip
            size="small"
            color="success"
            label={
              <span>
                {t('enemyEditor.enemyLevel')}
                <strong>{enemyLevel}</strong>
              </span>
            }
          />
          {allElementWithPhyKeys.map((element) => (
            <Typography key={element}>
              <EnemyResText element={element} enemyOverride={enemyOverride} />
            </Typography>
          ))}
          <Typography>
            {t('enemyEditor.defIgn', { value: enemyDefIgn_ })}
          </Typography>
          <Typography>
            {t('enemyEditor.defRed', { value: enemyDefRed_ })}
          </Typography>
          <Box flexGrow={1} display="flex" justifyContent="flex-end" gap={1}>
            <ExpandButton
              expand={expanded}
              onClick={toggle}
              aria-expanded={expanded}
              aria-label="show more"
              size="small"
              sx={{ marginLeft: 0 }}
            >
              <ExpandMoreIcon />
            </ExpandButton>
          </Box>
        </CardContent>
      </CardActionArea>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <EnemyEditor teamId={teamId} enemyOverride={enemyOverride} />
        </CardContent>
      </Collapse>
    </CardThemed>
  )
}

export function EnemyResText({
  enemyOverride,
  element,
}: {
  enemyOverride: Team['enemyOverride']
  element: ElementWithPhyKey
}) {
  const value = enemyOverride[`${element}_enemyRes_`]
  const immune = value === Number.MAX_VALUE
  const icon = <ElementIcon ele={element} iconProps={iconInlineProps} />
  const content = immune ? (
    <span>{icon} &#8734;</span>
  ) : (
    <span>
      {icon} <strong>{value}%</strong>
    </span>
  )
  return <ColorText color={element}>{content}</ColorText>
}

export function EnemyEditor({
  teamId,
  enemyOverride,
  bsProps = { xs: 12, md: 6 },
}: {
  teamId: string
  enemyOverride: Team['enemyOverride']
  bsProps?: object
}) {
  const { t } = useTranslation('page_team')
  const database = useDatabase()
  const defaultVal = 10

  const eLvl = enemyOverride.enemyLevel ?? 100
  const eDefRed = enemyOverride.enemyDefRed_ ?? 0
  const eDefIgn = enemyOverride.enemyDefIgn_ ?? 0
  return (
    <Grid container spacing={1}>
      <Grid item {...bsProps}>
        <Button
          fullWidth
          sx={{ height: '100%' }}
          size="small"
          component="a"
          color="warning"
          href="https://genshin-impact.fandom.com/wiki/Resistance#Base_Enemy_Resistances"
          target="_blank"
          rel="noreferrer"
        >
          {t('enemyEditor.announceBtn')}
        </Button>
      </Grid>
      <Grid item {...bsProps}>
        <StatInput
          sx={{ bgcolor: (t) => t.palette.contentLight.main, width: '100%' }}
          name={<b>{KeyMap.get('enemyLevel')}</b>}
          value={eLvl}
          placeholder={KeyMap.getStr('enemyLevel')}
          defaultValue={100}
          onValueChange={(value) =>
            database.teams.set(teamId, (team) => {
              team.enemyOverride.enemyLevel = value
            })
          }
          onReset={() =>
            database.teams.set(teamId, (team) => {
              delete team.enemyOverride.enemyLevel
            })
          }
        />
      </Grid>
      {allElementWithPhyKeys.map((eleKey) => {
        const statKey = `${eleKey}_enemyRes_` as EleEnemyResKey
        const val = enemyOverride[statKey]
        const elementImmunity = val === Number.MAX_VALUE
        return (
          <Grid item key={eleKey} {...bsProps}>
            <StatInput
              sx={{
                bgcolor: (t) => t.palette.contentLight.main,
                width: '100%',
              }}
              name={
                <ColorText color={eleKey}>
                  <b>{KeyMap.get(statKey)}</b>
                </ColorText>
              }
              value={
                val !== undefined ? (elementImmunity ? Infinity : val) : 10
              }
              placeholder={elementImmunity ? '∞ ' : KeyMap.getStr(statKey)}
              defaultValue={defaultVal}
              onValueChange={(value) =>
                database.teams.set(teamId, (team) => {
                  team.enemyOverride[statKey] = value
                })
              }
              disabled={elementImmunity}
              percent
            >
              <Button
                color={eleKey}
                onClick={() =>
                  database.teams.set(teamId, (team) => {
                    team.enemyOverride[statKey] = elementImmunity
                      ? defaultVal
                      : Number.MAX_VALUE
                  })
                }
                startIcon={
                  elementImmunity ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )
                }
              >
                {t('enemyEditor.immunity')}
              </Button>
            </StatInput>
          </Grid>
        )
      })}
      <Grid item {...bsProps}>
        <StatInput
          sx={{ bgcolor: (t) => t.palette.contentLight.main, width: '100%' }}
          name={<b>{KeyMap.get('enemyDefIgn_')}</b>}
          value={eDefIgn}
          placeholder={KeyMap.getStr('enemyDefIgn_')}
          defaultValue={0}
          onValueChange={(value) =>
            database.teams.set(teamId, (team) => {
              team.enemyOverride.enemyDefIgn_ = value
            })
          }
          percent
        />
      </Grid>
      <Grid item {...bsProps}>
        <StatInput
          sx={{ bgcolor: (t) => t.palette.contentLight.main, width: '100%' }}
          name={<b>{KeyMap.get('enemyDefRed_')}</b>}
          value={eDefRed}
          placeholder={KeyMap.getStr('enemyDefRed_')}
          defaultValue={0}
          onValueChange={(value) =>
            database.teams.set(teamId, (team) => {
              team.enemyOverride.enemyDefRed_ = value
            })
          }
          percent
        />
      </Grid>
      <Grid item xs={12}>
        <small>{t('enemyEditor.note')}</small>
      </Grid>
    </Grid>
  )
}
