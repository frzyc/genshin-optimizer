import {
  CardThemed,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  DropdownButton,
} from '@genshin-optimizer/common/ui'
import { objPathValue } from '@genshin-optimizer/common/util'
import type {
  AdditiveReactionKey,
  AmpReactionKey,
  InfusionAuraElementKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAmpReactionKeys,
  allMultiOptHitModeKeys,
  allowedAdditiveReactions,
  allowedAmpReactions,
} from '@genshin-optimizer/gi/consts'
import type { CustomTarget } from '@genshin-optimizer/gi/db'
import { CharacterContext } from '@genshin-optimizer/gi/db-ui'
import { isCharMelee } from '@genshin-optimizer/gi/stats'
import {
  AdditiveReactionModeText,
  AmpReactionModeText,
  DataContext,
  StatEditorList,
  infusionVals,
} from '@genshin-optimizer/gi/ui'
import type { NodeDisplay } from '@genshin-optimizer/gi/uidata'
import { allInputPremodKeys } from '@genshin-optimizer/gi/wr'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { Box, Button, ButtonGroup, Grid, MenuItem } from '@mui/material'
import { useCallback, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import OptimizationTargetSelector from '../Tabs/TabOptimize/Components/OptimizationTargetSelector'

const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element, key?: string) => (
  <Grid item key={key} xs={1}>
    {e}
  </Grid>
)
export default function CustomTargetDisplay({
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
  const { t } = useTranslation('page_character')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { path, weight, hitMode, reaction, infusionAura, bonusStats } =
    customTarget
  const setWeight = useCallback(
    (weight) => setCustomTarget({ ...customTarget, weight }),
    [customTarget, setCustomTarget]
  )
  const node = objPathValue(data.getDisplay(), path) as NodeDisplay | undefined
  const setFilter = useCallback(
    (bonusStats) => setCustomTarget({ ...customTarget, bonusStats }),
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
    <CardThemed bgt="light" sx={{ display: 'flex' }}>
      <Box sx={{ p: 1, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <CustomNumberInput
            float
            startAdornment="x"
            value={weight}
            onChange={setWeight}
            sx={{ borderRadius: 1, pl: 1 }}
            inputProps={{ sx: { pl: 0.5, width: '2em' }, min: 0 }}
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
              excludeSections: ['basic', 'custom'],
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
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
        <Grid container columns={{ xs: 1, lg: 2 }} sx={{ pt: 1 }} spacing={1}>
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
      <ButtonGroup
        orientation="vertical"
        sx={{ borderTopLeftRadius: 0, '*': { flexGrow: 1 } }}
      >
        <CustomNumberInputButtonGroupWrapper>
          <CustomNumberInput
            value={rank}
            onChange={setTargetIndex}
            sx={{ pl: 2 }}
            inputProps={{ sx: { width: '1em' }, min: 1, max: maxRank }}
          />
        </CustomNumberInputButtonGroupWrapper>
        <Button size="small" color="info" onClick={onDup}>
          <ContentCopyIcon />
        </Button>
        <Button size="small" color="error" onClick={deleteCustomTarget}>
          <DeleteForeverIcon />
        </Button>
      </ButtonGroup>
    </CardThemed>
  )
}
function ReactionDropdown({
  node,
  reaction,
  setReactionMode,
  infusionAura,
}: {
  node: NodeDisplay
  reaction?: AmpReactionKey | AdditiveReactionKey
  setReactionMode: (r?: AmpReactionKey | AdditiveReactionKey) => void
  infusionAura?: InfusionAuraElementKey
}) {
  const ele = node.info.variant ?? 'physical'
  const { t } = useTranslation('page_character')

  if (
    !['pyro', 'hydro', 'cryo', 'electro', 'dendro'].some(
      (e) => e === ele || e === infusionAura
    )
  )
    return null
  const reactions = [
    ...new Set([
      ...(allowedAmpReactions[ele] ?? []),
      ...(allowedAmpReactions[infusionAura ?? ''] ?? []),
      ...(allowedAdditiveReactions[ele] ?? []),
      ...(allowedAdditiveReactions[infusionAura ?? ''] ?? []),
    ]),
  ]
  const title = reaction ? (
    ([...allAmpReactionKeys] as string[]).includes(reaction) ? (
      <AmpReactionModeText reaction={reaction as AmpReactionKey} />
    ) : (
      <AdditiveReactionModeText reaction={reaction as AdditiveReactionKey} />
    )
  ) : (
    t`noReaction`
  )
  return (
    <DropdownButton title={title} sx={{ ml: 'auto' }}>
      <MenuItem value="" disabled={!reaction} onClick={() => setReactionMode()}>
        No Reactions
      </MenuItem>
      {reactions.map((rm) => (
        <MenuItem
          key={rm}
          disabled={reaction === rm}
          onClick={() => setReactionMode(rm)}
        >
          {([...allAmpReactionKeys] as string[]).includes(rm) ? (
            <AmpReactionModeText reaction={rm} />
          ) : (
            <AdditiveReactionModeText reaction={rm} />
          )}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
