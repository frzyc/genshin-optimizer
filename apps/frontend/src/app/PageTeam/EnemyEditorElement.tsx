import { useBoolState } from '@genshin-optimizer/common/react-util'
import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  CardThemed,
  ColorText,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { ElementWithPhyKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import type { Team } from '@genshin-optimizer/gi/db'
import { useDatabase, useTeam } from '@genshin-optimizer/gi/db-ui'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { CheckBox, CheckBoxOutlineBlank, Replay } from '@mui/icons-material'
import BarChartIcon from '@mui/icons-material/BarChart'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import StatInput from '../Components/StatInput'

export function EnemyEditorElement({ teamId }: { teamId: string }) {
  const { t } = useTranslation('ui')
  const database = useDatabase()
  const [show, onShow, onHide] = useBoolState()

  const { enemyOverride } = useTeam(teamId)!

  const enemyLevel = enemyOverride.enemyLevel
  const eDefRed = enemyOverride.enemyDefRed_
  const eDefIgn = enemyOverride.enemyDefIgn_
  const onReset = useCallback(
    () => database.teams.set(teamId, { enemyOverride: {} }),
    [database, teamId]
  )

  return (
    <>
      <ModalWrapper open={show} onClose={onHide}>
        <CardThemed>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  size="small"
                  color="success"
                  label={
                    <span>
                      Enemy <strong>{enemyLevel}</strong>
                    </span>
                  }
                />
                {allElementWithPhyKeys.map((element) => (
                  <Typography key={element}>
                    <EnemyResText
                      element={element}
                      enemyOverride={enemyOverride}
                    />
                  </Typography>
                ))}
                <Typography>DEF Red. {eDefRed}%</Typography>
                <Typography>DEF Ignore {eDefIgn}%</Typography>
              </Box>
            }
            action={
              <Button
                size="small"
                color="error"
                onClick={onReset}
                startIcon={<Replay />}
              >{t`reset`}</Button>
            }
          />
          <Divider />
          <CardContent>
            <EnemyEditor teamId={teamId} enemyOverride={enemyOverride} />
          </CardContent>
        </CardThemed>
      </ModalWrapper>
      <Button onClick={onShow} color="info" startIcon={<BarChartIcon />}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <span>Enemy Config</span>
          <Chip
            size="small"
            color="success"
            label={
              <span>
                <strong>Lv. {enemyLevel}</strong>
              </span>
            }
          />
        </Box>
      </Button>
    </>
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
  const database = useDatabase()
  const defaultVal = 10

  const eLvl = enemyOverride.enemyLevel
  const eDefRed = enemyOverride.enemyDefIgn_ ?? 0
  const eDefIgn = enemyOverride.enemyDefRed_ ?? 0
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
          To get the specific resistance values of enemies, please visit the
          wiki.
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
        const statKey = `${eleKey}_enemyRes_`
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
                  elementImmunity ? <CheckBox /> : <CheckBoxOutlineBlank />
                }
              >
                Immunity
              </Button>
            </StatInput>
          </Grid>
        )
      })}
      <Grid item {...bsProps}>
        <StatInput
          sx={{ bgcolor: (t) => t.palette.contentLight.main, width: '100%' }}
          name={<b>{KeyMap.get('enemyDefIgn_')}</b>}
          value={eDefRed}
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
          value={eDefIgn}
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
        <small>
          Note: Genshin Impact halves resistance shred values below 0%. For the
          sake of calculations enter the RAW value and GO will do the rest.
          (e.g. 10% - 20% = -10%)
        </small>
      </Grid>
    </Grid>
  )
}
