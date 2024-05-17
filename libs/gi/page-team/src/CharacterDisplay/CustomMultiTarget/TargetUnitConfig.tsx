import { DropdownButton, TextFieldLazy } from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import { allMultiOptHitModeKeys } from '@genshin-optimizer/gi/consts'
import type { CustomTarget } from '@genshin-optimizer/gi/db'
import { CharacterContext } from '@genshin-optimizer/gi/db-ui'
import { isCharMelee } from '@genshin-optimizer/gi/stats'
import {
  DataContext,
  StatEditorList,
  infusionVals,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import { allInputPremodKeys } from '@genshin-optimizer/gi/wr'
import { Box, Grid, MenuItem } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from '../Tabs/TabOptimize/Components/OptimizationTargetSelector'
import ReactionDropdown from './ReactionDropdown'

const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element, key?: string) => (
  <Grid item key={key} xs={1}>
    {e}
  </Grid>
)

export default function TargetUnitConfig({
  customTarget,
  setCustomTarget,
}: {
  customTarget: CustomTarget
  setCustomTarget: (t: CustomTarget) => void
  onDup: () => void
}): JSX.Element {
  const { t } = useTranslation('page_character')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { path, hitMode, reaction, infusionAura, bonusStats, description } =
    customTarget

  const node = objPathValue(data.getDisplay(), path) as CalcResult | undefined
  const setFilter = useCallback(
    (bonusStats: CustomTarget['bonusStats']) =>
      setCustomTarget({ ...customTarget, bonusStats }),
    [customTarget, setCustomTarget]
  )

  const statEditorList = useMemo(
    () => (
      <StatEditorList
        statKeys={keys}
        statFilters={bonusStats}
        setStatFilters={setFilter}
        wrapperFunc={wrapperFunc}
        label={t('addStats.label')}
      />
    ),
    [bonusStats, setFilter, t]
  )

  const isMeleeAuto =
    isCharMelee(characterKey) &&
    (path[0] === 'normal' || path[0] === 'charged' || path[0] === 'plunging')
  const isTransformativeReaction = path[0] === 'reaction'
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <OptimizationTargetSelector
          optimizationTarget={path}
          setTarget={(path) =>
            setCustomTarget({
              ...customTarget,
              path,
              reaction: undefined,
              infusionAura: undefined,
            })
          }
          showEmptyTargets
          targetSelectorModalProps={{
            excludeSections: ['custom'],
          }}
        />
        {node && (
          <ReactionDropdown
            reaction={reaction}
            setReactionMode={(rm) =>
              setCustomTarget({ ...customTarget, reaction: rm })
            }
            node={node}
            infusionAura={infusionAura}
          />
        )}
        <DropdownButton title={t(`hitmode.${hitMode}`)}>
          {allMultiOptHitModeKeys.map((hm) => (
            <MenuItem
              key={hm}
              value={hm}
              disabled={hitMode === hm}
              onClick={() => setCustomTarget({ ...customTarget, hitMode: hm })}
            >
              {t(`hitmode.${hm}`)}
            </MenuItem>
          ))}
        </DropdownButton>
      </Box>
      <Grid container columns={{ xs: 1, md: 2 }} spacing={1}>
        <Grid item xs={1}>
          <Box>
            <Grid container columns={{ xs: 1 }} sx={{ pt: 1 }} spacing={1}>
              {(isMeleeAuto || isTransformativeReaction) && (
                <Grid item xs={1}>
                  <DropdownButton
                    title={infusionVals[infusionAura ?? '']}
                    color={infusionAura || 'secondary'}
                    disableElevation
                    fullWidth
                  >
                    {Object.entries(infusionVals).map(([key, text]) => (
                      <MenuItem
                        key={key}
                        sx={key ? { color: `${key}.main` } : undefined}
                        selected={key === infusionAura}
                        disabled={key === infusionAura}
                        onClick={() =>
                          setCustomTarget({
                            ...customTarget,
                            infusionAura: key ? key : undefined,
                            reaction: undefined,
                          })
                        }
                      >
                        {text}
                      </MenuItem>
                    ))}
                  </DropdownButton>
                </Grid>
              )}
              {statEditorList}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={1}>
          <TextFieldLazy
            fullWidth
            label="Target Description"
            value={description}
            onChange={(description) =>
              setCustomTarget({ ...customTarget, description })
            }
            multiline
            minRows={2}
            sx={{ mt: 1 }}
          />
        </Grid>
      </Grid>
    </>
  )
}
