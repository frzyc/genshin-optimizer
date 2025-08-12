import {
  CardThemed,
  DropdownButton,
  TextFieldLazy,
  usePrev,
} from '@genshin-optimizer/common/ui'
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  CardActionArea,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from '../Tabs/TabOptimize/Components/OptimizationTargetSelector'
import ReactionDropdown from './ReactionDropdown'

const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element, key?: string) => (
  <Grid item key={key} xs={1}>
    {e}
  </Grid>
)

export default function MTargetEditor({
  customTarget,
  setCustomTarget,
  deleteCustomTarget,
  rank,
  maxRank,
  setTargetIndex,
  onDup,
}: {
  customTarget: CustomTarget
  setCustomTarget: (t: CustomTarget) => void
  deleteCustomTarget: () => void
  rank: number
  maxRank: number
  setTargetIndex: (ind?: number) => void
  onDup: () => void
}) {
  const { t } = useTranslation(['page_character', 'loadout'])
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const {
    path,
    weight,
    hitMode,
    reaction,
    infusionAura,
    bonusStats,
    description,
  } = customTarget

  const [collapse, setcollapse] = useState(true)

  const setWeight = useCallback(
    (weight: number) => setCustomTarget({ ...customTarget, weight }),
    [customTarget, setCustomTarget]
  )
  const node = objPathValue(data.getDisplay(), path) as CalcResult | undefined
  const setFilter = useCallback(
    (bonusStats: CustomTarget['bonusStats']) =>
      setCustomTarget({ ...customTarget, bonusStats }),
    [customTarget, setCustomTarget]
  )
  // Expand editor on change of custom target
  if (usePrev(customTarget) !== customTarget && collapse) setcollapse(false)

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

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <CardThemed
      bgt="light"
      sx={{
        boxShadow: '0 0 10px black',
        position: 'sticky',
        bottom: `10px`,
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <CardActionArea
          sx={{
            display: 'flex',
            flexGrow: 1,
            gap: 1,
            height: '100%',
            py: 1,
            alignItems: 'center',
          }}
          onClick={() => setcollapse((c) => !c)}
        >
          <Typography variant="h6">
            {t('loadout:mTargetEditor.title')}
          </Typography>
          {collapse ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </CardActionArea>
        <TextFieldLazy
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isMobile
                  ? t('loadout:mTargetEditor.rankMobile')
                  : t('loadout:mTargetEditor.rank')}
              </InputAdornment>
            ),
          }}
          inputProps={{
            sx: { width: '2em' },
            min: 1,
            max: maxRank,
          }}
          type="number"
          value={rank.toString()}
          onChange={(v) => setTargetIndex(parseInt(v))}
          size="small"
          sx={{ minWidth: isMobile ? '4em' : '6em' }}
        />

        <IconButton color="info" onClick={onDup}>
          <ContentCopyIcon />
        </IconButton>
        <IconButton color="error" onClick={deleteCustomTarget}>
          <DeleteForeverIcon />
        </IconButton>
      </Box>
      <Divider />
      <Collapse in={!collapse}>
        <Box display="flex">
          <Box sx={{ p: 1, flexGrow: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <TextFieldLazy
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">x</InputAdornment>
                  ),
                }}
                inputProps={{
                  sx: { width: '2em' },
                }}
                type="number"
                value={weight.toString()}
                onChange={(v) => setWeight(parseFloat(v))}
                size="small"
              />
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
                  flatOnly: true,
                  excludeSections: [
                    'basic',
                    'bonusStats',
                    'custom',
                    'character',
                    'teamBuff',
                  ],
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
                    onClick={() =>
                      setCustomTarget({ ...customTarget, hitMode: hm })
                    }
                  >
                    {t(`hitmode.${hm}`)}
                  </MenuItem>
                ))}
              </DropdownButton>
            </Box>
            <Grid container columns={{ xs: 1, md: 2 }} spacing={1}>
              <Grid item xs={1}>
                <Box>
                  <Grid
                    container
                    columns={{ xs: 1 }}
                    sx={{ pt: 1 }}
                    spacing={1}
                  >
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
                  label={t('loadout:mTargetEditor.desc')}
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
          </Box>
        </Box>
      </Collapse>
    </CardThemed>
  )
}
