import type {
  AdditiveReactionKey,
  AmpReactionKey,
  HitModeKey,
  InfusionAuraElementKey,
} from '@genshin-optimizer/consts'
import {
  allAdditiveReactions,
  allAmpReactionKeys,
  allHitModeKeys,
  allInfusionAuraElementKeys,
} from '@genshin-optimizer/consts'
import { useBoolState, useTimeout } from '@genshin-optimizer/react-util'
import {
  arrayMove,
  clamp,
  deepClone,
  objPathValue,
} from '@genshin-optimizer/util'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import type { ChangeEvent, FocusEvent } from 'react'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Trans, useTranslation } from 'react-i18next'
import AdditiveReactionModeText from '../Components/AdditiveReactionModeText'
import AmpReactionModeText from '../Components/AmpReactionModeText'
import CardDark from '../Components/Card/CardDark'
import CloseButton from '../Components/CloseButton'
import ColorText from '../Components/ColoredText'
import CustomNumberInput, {
  CustomNumberInputButtonGroupWrapper,
} from '../Components/CustomNumberInput'
import DropdownButton from '../Components/DropdownMenu/DropdownButton'
import { infusionVals } from '../Components/HitModeEditor'
import InfoTooltip from '../Components/InfoTooltip'
import ModalWrapper from '../Components/ModalWrapper'
import StatEditorList from '../Components/StatEditorList'
import { CharacterContext } from '../Context/CharacterContext'
import { DataContext } from '../Context/DataContext'
import type { InputPremodKey } from '../Formula'
import { allInputPremodKeys } from '../Formula'
import type { NodeDisplay } from '../Formula/uiData'
import { UIData } from '../Formula/uiData'
import type { CustomMultiTarget, CustomTarget } from '../Types/character'
import { allowedAdditiveReactions, allowedAmpReactions } from '../Types/consts'
import OptimizationTargetSelector from './CharacterDisplay/Tabs/TabOptimize/Components/OptimizationTargetSelector'
import { TargetSelectorModal } from './CharacterDisplay/Tabs/TabOptimize/Components/TargetSelectorModal'

const MAX_NAME_LENGTH = 200
const MAX_DESC_LENGTH = 2000
const MAX_DESC_TOOLTIP_LENGTH = 300
function initCustomMultiTarget() {
  return {
    name: 'New Custom Target',
    targets: [],
  }
}
function initCustomTarget(path: string[], multi = 1): CustomTarget {
  return {
    weight: multi,
    path,
    hitMode: 'avgHit',
    bonusStats: {},
  }
}
function validateOptTarget(path: string[]): string[] {
  // TODO: validate path. This function will probably need to be async
  return path
}
function validateCustomTarget(ct: unknown): CustomTarget | undefined {
  if (typeof ct !== 'object') return undefined
  let { weight, path, hitMode, reaction, infusionAura, bonusStats } =
    ct as CustomTarget

  if (typeof weight !== 'number' || weight <= 0) weight = 1

  if (!Array.isArray(path) || path[0] === 'custom') return undefined

  path = validateOptTarget(path)

  if (
    !hitMode ||
    typeof hitMode !== 'string' ||
    !allHitModeKeys.includes(hitMode as HitModeKey)
  )
    hitMode = 'avgHit'

  if (
    reaction &&
    !(allAmpReactionKeys as readonly string[]).includes(reaction) &&
    !(allAdditiveReactions as readonly string[]).includes(reaction)
  )
    reaction = undefined

  if (infusionAura && !allInfusionAuraElementKeys.includes(infusionAura))
    infusionAura = undefined

  if (!bonusStats) bonusStats = {}

  bonusStats = Object.fromEntries(
    Object.entries(bonusStats).filter(
      ([key, value]) =>
        allInputPremodKeys.includes(key as InputPremodKey) &&
        typeof value == 'number'
    )
  )

  return { weight, path, hitMode, reaction, infusionAura, bonusStats }
}
export function validateCustomMultiTarget(
  cmt: unknown
): CustomMultiTarget | undefined {
  if (typeof cmt !== 'object') return undefined
  let { name, description, targets } = cmt as CustomMultiTarget
  if (typeof name !== 'string') name = 'New Custom Target'
  else if (name.length > MAX_NAME_LENGTH) name = name.slice(0, MAX_NAME_LENGTH)
  if (typeof description !== 'string') description = undefined
  else if (description.length > MAX_DESC_LENGTH)
    description = description.slice(0, MAX_DESC_LENGTH)
  if (!Array.isArray(targets)) return undefined
  targets = targets
    .map((t) => validateCustomTarget(t))
    .filter((t): t is NonNullable<CustomTarget> => t !== undefined)
  return { name, description, targets }
}

export function CustomMultiTargetButton() {
  const { t } = useTranslation('page_character')
  const [show, onShow, onCloseModal] = useBoolState()
  const { character, characterDispatch } = useContext(CharacterContext)
  const [customMultiTarget, setCustomTargets] = useState(
    () => character.customMultiTarget
  )

  useEffect(
    () => setCustomTargets(character.customMultiTarget),
    [setCustomTargets, character.customMultiTarget]
  )

  const [expandedInd, setExpandedInd] = useState<number | false>(false)

  const addNewCustomMultiTarget = useCallback(() => {
    setCustomTargets([...customMultiTarget, initCustomMultiTarget()])
    setExpandedInd(customMultiTarget.length)
  }, [customMultiTarget, setCustomTargets, setExpandedInd])
  const setCustomMultiTarget = useCallback(
    (ind: number) => (newTarget: CustomMultiTarget) => {
      const customTargets_ = [...customMultiTarget]
      customTargets_[ind] = newTarget
      setCustomTargets(customTargets_)
    },
    [customMultiTarget, setCustomTargets]
  )
  const deleteCustomMultiTarget = useCallback(
    (ind: number) => () => {
      if (
        customMultiTarget[ind].targets.length &&
        !window.confirm(
          `Are you sure you want to delete "${customMultiTarget[ind].name}"?`
        )
      )
        return
      const customTargets_ = [...customMultiTarget]
      customTargets_.splice(ind, 1)
      setCustomTargets(customTargets_)
    },
    [customMultiTarget, setCustomTargets]
  )
  const dupCustomMultiTarget = useCallback(
    (ind: number) => () => {
      const customTargets_ = [...customMultiTarget]
      customTargets_.splice(ind, 0, customMultiTarget[ind])
      setCustomTargets(customTargets_)
    },
    [customMultiTarget, setCustomTargets]
  )
  const setOrder = useCallback(
    (fromIndex: number) => (toIndex: number) => {
      toIndex = clamp(toIndex - 1, 0, customMultiTarget.length - 1)
      if (fromIndex === toIndex) return
      const arr = [...customMultiTarget]
      const element = arr[fromIndex]
      arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, element)
      setCustomTargets(arr)
    },
    [customMultiTarget, setCustomTargets]
  )
  const onClose = useCallback(() => {
    onCloseModal()
    characterDispatch({ customMultiTarget })
  }, [customMultiTarget, onCloseModal, characterDispatch])
  const onExpand = useCallback(
    (i: number) => () => setExpandedInd(i === expandedInd ? false : i),
    [expandedInd]
  )

  const { data: origUIData, teamData } = useContext(DataContext)
  const dataContextObj = useMemo(() => {
    // Make sure that the fields we're deleting belong to
    // copies. We don't need deep copies though, as the
    // rest of the Data are still intact.
    const origData = origUIData.data[0]
    const newData = {
      ...origData,
      hit: { ...origData.hit },
      infusion: { ...origData.infusion },
    }
    delete newData.hit.reaction
    delete newData.infusion.team
    return {
      data: new UIData(newData, undefined),
      teamData,
    }
  }, [origUIData, teamData])

  const customMultiTargetDisplays = useMemo(
    () =>
      customMultiTarget.map((ctar, i) => (
        <CustomMultiTargetDisplay
          // Use a unique key, because indices dont allow for swapping very well.
          key={`${i}${ctar.name}`}
          index={i}
          expanded={i === expandedInd}
          onExpand={onExpand(i)}
          target={ctar}
          setTarget={setCustomMultiTarget(i)}
          onDelete={deleteCustomMultiTarget(i)}
          onDup={dupCustomMultiTarget(i)}
          onOrder={setOrder(i)}
          nTargets={customMultiTarget.length}
        />
      )),
    [
      customMultiTarget,
      deleteCustomMultiTarget,
      dupCustomMultiTarget,
      expandedInd,
      onExpand,
      setCustomMultiTarget,
      setOrder,
    ]
  )

  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" height="100%" width={100} />}
    >
      <Button
        color="info"
        onClick={onShow}
        startIcon={<SettingsIcon />}
      >{t`multiTarget.title`}</Button>
      <DataContext.Provider value={dataContextObj}>
        <ModalWrapper
          open={show}
          onClose={onClose}
          containerProps={{ sx: { overflow: 'visible' } }}
        >
          <CardDark>
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <Box display="flex" gap={1} alignItems="center">
                <Typography variant="h6">{t`multiTarget.title`}</Typography>
                <InfoTooltip
                  title={
                    <Typography>
                      <Trans t={t} i18nKey="multiTarget.info1">
                        Note: Community created custom Multi-Optimization
                        Targets can be found within the
                        <a
                          href={process.env.NX_URL_DISCORD_GO}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GO Discord
                        </a>
                        or
                        <a
                          href={process.env.NX_URL_KQM_MULTI_GUIDE}
                          target="_blank"
                          rel="noreferrer"
                        >
                          KQM Multi-Opt Guide
                        </a>
                        , however the validity of such configurations cannot be
                        guaranteed.
                      </Trans>
                      <br />
                      <br />
                      {t('multiTarget.info2')}
                    </Typography>
                  }
                />
                <CloseButton onClick={onClose} sx={{ marginLeft: 'auto' }} />
              </Box>
              <Box>
                {customMultiTargetDisplays}
                <Button
                  fullWidth
                  onClick={addNewCustomMultiTarget}
                  startIcon={<AddIcon />}
                  sx={{ mt: 1 }}
                >{t`multiTarget.addNewMTarget`}</Button>
              </Box>
            </CardContent>
          </CardDark>
        </ModalWrapper>
      </DataContext.Provider>
    </Suspense>
  )
}

function CustomMultiTargetDisplay({
  index,
  target,
  setTarget,
  expanded,
  onExpand,
  onDelete,
  onDup,
  onOrder,
  nTargets,
}: {
  index: number
  target: CustomMultiTarget
  setTarget: (t: CustomMultiTarget) => void
  expanded: boolean
  onExpand: () => void
  onDelete: () => void
  onDup: () => void
  onOrder: (nInd: number) => void
  nTargets: number
}) {
  const { t } = useTranslation('page_character')
  const saveName = useCallback(
    (name: string) => setTarget({ ...target, name }),
    [setTarget, target]
  )
  const saveDesc = useCallback(
    (description: string) => setTarget({ ...target, description }),
    [setTarget, target]
  )
  const addTarget = useCallback(
    (t: string[], multi?: number) => {
      const target_ = { ...target }
      target_.targets = [...target_.targets, initCustomTarget(t, multi)]
      setTarget(target_)
    },
    [target, setTarget]
  )

  const setCustomTarget = useCallback(
    (index: number) => (ctarget: CustomTarget) => {
      const targets = [...target.targets]
      targets[index] = ctarget
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const deleteCustomTarget = useCallback(
    (index: number) => () => {
      if (
        Object.values(target.targets[index].bonusStats).length &&
        !window.confirm(`Are you sure you want to delete this target?`)
      )
        return
      const targets = [...target.targets]
      targets.splice(index, 1)
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const setTargetIndex = useCallback(
    (oldInd: number) => (newRank?: number) => {
      if (newRank === undefined || newRank === 0) return
      const newInd = newRank - 1
      const targets = [...target.targets]
      arrayMove(targets, oldInd, newInd)
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const dupCustomTarget = useCallback(
    (index: number) => () => {
      const targets = [...target.targets]
      targets.splice(index, 0, deepClone(targets[index]))
      setTarget({ ...target, targets })
    },
    [target, setTarget]
  )

  const customTargetDisplays = useMemo(
    () =>
      target.targets.map((t, i) => (
        <CustomTargetDisplay
          key={t.path.join() + i}
          customTarget={t}
          setCustomTarget={setCustomTarget(i)}
          deleteCustomTarget={deleteCustomTarget(i)}
          rank={i + 1}
          maxRank={target.targets.length}
          setTargetIndex={setTargetIndex(i)}
          onDup={dupCustomTarget(i)}
        />
      )),
    [
      deleteCustomTarget,
      dupCustomTarget,
      setCustomTarget,
      setTargetIndex,
      target.targets,
    ]
  )

  return (
    <Accordion sx={{ bgcolor: 'contentLight.main' }} expanded={expanded}>
      <AccordionSummary
        expandIcon={
          <Button
            color="info"
            sx={{ pointerEvents: 'auto' }}
            onClick={onExpand}
          >
            <SettingsIcon />
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </Button>
        }
        component="div"
        sx={{
          pointerEvents: 'none',
          // Prevent rotation of the button, since we have two icons in the button
          '& .MuiAccordionSummary-expandIconWrapper': {
            transform: 'rotate(0)',
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(0)',
          },
        }}
      >
        <Box
          gap={1}
          pr={1}
          display="flex"
          flexWrap="wrap"
          sx={{ pointerEvents: 'auto', width: '100%', alignItems: 'center' }}
        >
          <Chip
            sx={{ minWidth: '8em' }}
            color={target.targets.length ? 'success' : undefined}
            label={
              <Trans
                t={t}
                i18nKey="multiTarget.target"
                count={target.targets.length}
              >
                {{ count: target.targets.length }} Targets
              </Trans>
            }
          />
          <NameTextField name={target.name} setName={saveName} />
          {target.description && (
            <InfoTooltip
              title={
                <Typography>
                  {target.description.length > MAX_DESC_TOOLTIP_LENGTH
                    ? target.description.slice(0, MAX_DESC_TOOLTIP_LENGTH) +
                      '...'
                    : target.description}
                </Typography>
              }
            />
          )}
          <ButtonGroup size="small">
            <CustomNumberInputButtonGroupWrapper>
              <CustomNumberInput
                onChange={(n) => onOrder(n ?? 0)}
                value={index + 1}
                inputProps={{
                  min: 1,
                  max: nTargets,
                  sx: { textAlign: 'center' },
                }}
                sx={{ width: '100%', height: '100%', pl: 2 }}
              />
            </CustomNumberInputButtonGroupWrapper>
            <Tooltip title={t('multiTarget.duplicate')} placement="top">
              <Button onClick={onDup} color="info">
                <ContentCopyIcon />
              </Button>
            </Tooltip>
            <Button color="error" onClick={onDelete}>
              <DeleteForeverIcon />
            </Button>
          </ButtonGroup>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box
          mb={1}
          display="flex"
          sx={{ pointerEvents: 'auto', width: '100%' }}
        >
          <DescTextField desc={target.description ?? ''} setDesc={saveDesc} />
        </Box>
        <Box mb={1}>
          <CopyArea
            customMultiTarget={target}
            setCustomMultiTarget={setTarget}
          />
        </Box>
        <Box display="flex" gap={1} flexDirection="column">
          {customTargetDisplays}
          <AddCustomTargetBtn setTarget={addTarget} />
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
function NameTextField({
  name,
  setName,
}: {
  name: string
  setName: (name: string) => void
}) {
  const [innerName, setInnerName] = useState(name)
  useEffect(() => setInnerName(name), [name, setInnerName])
  const [error, onError, noNotError] = useBoolState(false)
  const timeoutFunc = useTimeout()
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value
    if (newVal.length >= MAX_NAME_LENGTH) {
      timeoutFunc(noNotError, 2000)
      onError()
      newVal = newVal.slice(0, MAX_NAME_LENGTH)
    } else timeoutFunc(noNotError, 1)
    setInnerName(newVal)
  }
  return (
    <TextField
      error={error}
      size="small"
      value={innerName}
      onChange={onChange}
      onBlur={(_e: FocusEvent<HTMLInputElement>) => setName(innerName)}
      sx={{ flexGrow: 1 }}
    />
  )
}
function DescTextField({
  desc,
  setDesc,
}: {
  desc: string
  setDesc: (desc: string) => void
}) {
  const { t } = useTranslation('page_character')
  const [innerDesc, setInnerDesc] = useState(desc)
  useEffect(() => setInnerDesc(desc), [desc, setInnerDesc])
  const [error, onError, noNotError] = useBoolState(false)
  const timeoutFunc = useTimeout()
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value
    if (newVal.length >= MAX_DESC_LENGTH) {
      timeoutFunc(noNotError, 2000)
      onError()
      newVal = newVal.slice(0, MAX_DESC_LENGTH)
    } else timeoutFunc(noNotError, 1)
    setInnerDesc(newVal)
  }

  return (
    <TextField
      error={error}
      multiline
      size="small"
      placeholder={t('multiTarget.description')}
      value={innerDesc}
      onChange={onChange}
      onBlur={(_e: FocusEvent<HTMLInputElement>) => setDesc(innerDesc)}
      sx={{ flexGrow: 1 }}
    />
  )
}
const keys = [...allInputPremodKeys]
const wrapperFunc = (e: JSX.Element, key?: string) => (
  <Grid item key={key} xs={1}>
    {e}
  </Grid>
)
function CustomTargetDisplay({
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
  const { characterSheet } = useContext(CharacterContext)
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
      />
    ),
    [bonusStats, setFilter]
  )

  const isMeleeAuto =
    characterSheet?.isMelee() &&
    (path[0] === 'normal' || path[0] === 'charged' || path[0] === 'plunging')
  const isTransformativeReaction = path[0] === 'reaction'
  return (
    <CardDark sx={{ display: 'flex' }}>
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
            {allHitModeKeys.map((hm) => (
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
    </CardDark>
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
function AddCustomTargetBtn({
  setTarget,
}: {
  setTarget: (t: string[], m?: number) => void
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState(false)
  const setTargetHandler = useCallback(
    (target: string[], multi?: number) => {
      onClose()
      setTarget(target, multi)
    },
    [onClose, setTarget]
  )

  return (
    <>
      <Button
        fullWidth
        onClick={onShow}
        startIcon={<AddIcon />}
        sx={{ mb: 1 }}
      >{t`multiTarget.addNewTarget`}</Button>
      <TargetSelectorModal
        showEmptyTargets
        flatOnly
        excludeHeal
        show={show}
        onClose={onClose}
        setTarget={setTargetHandler}
        excludeSections={['basic', 'custom']}
      />
    </>
  )
}
const TextArea = styled('textarea')({
  width: '100%',
  fontFamily: 'monospace',
  resize: 'vertical',
  minHeight: '2em',
})
function CopyArea({
  customMultiTarget,
  setCustomMultiTarget,
}: {
  customMultiTarget: CustomMultiTarget
  setCustomMultiTarget: (t: CustomMultiTarget) => void
}) {
  const [value, setValue] = useState(JSON.stringify(customMultiTarget))
  const [error, setError] = useState('')
  useEffect(() => {
    setError('')
    setValue(JSON.stringify(customMultiTarget))
  }, [customMultiTarget, setValue])
  const copyToClipboard = useCallback(
    () =>
      navigator.clipboard
        .writeText(value)
        .then(() => alert('Copied configuration to clipboard.'))
        .catch(console.error),
    [value]
  )
  const validate = useCallback(
    (v: string) => {
      setError('')
      setValue(v)
      try {
        const validated = validateCustomMultiTarget(JSON.parse(v))
        if (!validated) setError('Invalid Multi-Optimization Config')
        else setCustomMultiTarget(validated)
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      }
    },
    [setValue, setCustomMultiTarget]
  )

  return (
    <Box>
      <Box display="flex" gap={1}>
        <TextArea
          value={value}
          sx={{ outlineColor: error ? 'red' : undefined }}
          onClick={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.selectionStart = 0
            target.selectionEnd = target.value.length
          }}
          onChange={(e) => validate(e.target.value)}
        />
        <Button color="info" disabled={!!error} onClick={copyToClipboard}>
          <ContentPasteIcon />
        </Button>
      </Box>
      {!!error && (
        <ColorText color="error">
          <Typography>{error}</Typography>
        </ColorText>
      )}
    </Box>
  )
}
