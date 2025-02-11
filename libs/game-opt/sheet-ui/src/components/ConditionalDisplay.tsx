'use client'
import type { CardBackgroundColor } from '@genshin-optimizer/common/ui'
import {
  CardThemed,
  DropdownButton,
  NumberInputLazy,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type {
  IListConditionalData,
  INumConditionalData,
} from '@genshin-optimizer/game-opt/formula'
import { CalcContext, TagContext } from '@genshin-optimizer/game-opt/formula-ui'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import type { SliderProps } from '@mui/material'
import {
  Box,
  Button,
  Divider,
  MenuItem,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { ConditionalValuesContext } from '../context'
import type { Conditional } from '../types'
import { FieldsDisplay } from './FieldDisplay'
import { HeaderDisplay } from './HeaderDisplay'

export function ConditionalsDisplay({
  conditional,
  bgt,
}: {
  bgt?: CardBackgroundColor
  conditional: Conditional
}) {
  const { srcDisplay } = useContext(SrcDstDisplayContext)
  const setConditional = useContext(SetConditionalContext)
  const {
    metadata: { sheet, name },
    targeted,
  } = conditional
  const conditionals = useContext(ConditionalValuesContext)
  // Allowing showing an "empty" conditional UI for user to add new conditionals

  const filteredConditionals = useMemo(
    () =>
      conditionals.filter(
        ({ condValue, sheet: s, condKey }) =>
          condValue && s === sheet && condKey === name
      ),
    [conditionals, sheet, name]
  )

  const hasExisting = useCallback(
    (src: string | null, dst: string | null) =>
      filteredConditionals.some(({ src: s, dst: d }) => s === src && d === dst),
    [filteredConditionals]
  )

  // Default to first teammate as src.
  // Null src can lead to crashes in specific instances, so it shouldn't be the default
  const [src, setSrc] = useState<string | null>(Object.keys(srcDisplay)[0])
  // Default null (aka All) as dst.
  // Most convenient for users
  const [dst, setDst] = useState<string | null>(null)
  return (
    <Stack spacing={1}>
      {filteredConditionals.map(({ src, dst, condKey, condValue }) => (
        <ConditionalDisplay
          key={src ?? 'all' + dst ?? 'all' + condKey}
          conditional={conditional}
          src={src}
          dst={dst}
          value={condValue}
          setValue={(v) => setConditional(sheet, name, src, dst, v)}
          bgt={bgt}
        />
      ))}
      {/* // empty default conditional UI */}
      {(targeted || !filteredConditionals.length) && (
        <ConditionalDisplay
          conditional={conditional}
          bgt={bgt}
          src={src}
          setSrc={setSrc}
          dst={dst}
          setDst={setDst}
          value={0}
          setValue={(v) => setConditional(sheet, name, src, dst, v)}
          disabled={hasExisting(src, dst)}
        />
      )}
    </Stack>
  )
}

export const SrcDstDisplayContext = createContext<{
  srcDisplay: Record<string, ReactNode>
  dstDisplay: Record<string, ReactNode>
}>({
  srcDisplay: {},
  dstDisplay: {},
})
export type SetConditionalFunc = (
  sheet: string,
  condKey: string,
  src: string | null,
  dst: string | null,
  value: number
) => void
export const SetConditionalContext = createContext<SetConditionalFunc>(() =>
  console.warn('SetConditional NOT IMPLEMENTED')
)
const ConditionalDisplay = memo(function ConditionalDisplay({
  conditional,
  src,
  setSrc,
  dst,
  setDst,
  value,
  setValue,
  bgt = 'normal',
  disabled,
}: {
  conditional: Conditional
  src: string | null
  setSrc?: (src: string | null) => void
  dst: string | null
  setDst?: (dst: string | null) => void
  value: number
  setValue: (value: number) => void
  bgt?: CardBackgroundColor
  disabled?: boolean
}) {
  const { header, fields, targeted } = conditional
  const { srcDisplay, dstDisplay } = useContext(SrcDstDisplayContext)
  const tag = useContext(TagContext)
  const newTag = useMemo(
    () => ({
      ...tag,
      src,
      dst,
    }),
    [tag, src, dst]
  )
  return (
    <CardThemed bgt={bgt}>
      {!!header && <HeaderDisplay header={header} />}
      {targeted && (
        <CondSrcDst
          src={src}
          srcDisplay={srcDisplay}
          setSrc={setSrc}
          dst={dst}
          dstDisplay={dstDisplay}
          setDst={setDst}
        />
      )}
      <ConditionalSelector
        disabled={disabled}
        conditional={conditional}
        setValue={setValue}
        value={value}
      />
      {!!fields && (
        <TagContext.Provider value={newTag}>
          <FieldsDisplay bgt={bgt} fields={fields} />
        </TagContext.Provider>
      )}
    </CardThemed>
  )
})
type ConditionalProps = {
  conditional: Conditional
  setValue: (value: number) => void
  value: number
  disabled?: boolean
}
function ConditionalSelector(props: ConditionalProps) {
  switch (props.conditional.metadata.type) {
    case 'bool':
      return <BoolConditional {...props} />
    case 'list':
      return <ListConditional {...props} />
    case 'num':
      return <NumConditional {...props} />
    default:
      return null
  }
}
function Badge({ children }: { children: ReactNode }) {
  if (!children) return null
  return <SqBadge sx={{ ml: 1 }}>{children}</SqBadge>
}

function BoolConditional({
  conditional,
  setValue,
  value,
  disabled,
}: ConditionalProps) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const { sheet: sheetKey, name: condKey } = conditional.metadata
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null

  const labelEle = evalIfFunc(label, calc, value)
  const badgeEle = evalIfFunc(badge, calc, value)
  return (
    <Button
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={value ? 'success' : 'primary'}
      onClick={() => setValue(+!value)}
      // disabled={disabled}
      startIcon={value ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
      disabled={disabled}
    >
      {labelEle} <Badge>{badgeEle}</Badge>
    </Button>
  )
}
function ListConditional({
  conditional,
  setValue,
  value,
  disabled,
}: ConditionalProps) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const {
    sheet: sheetKey,
    name: condKey,
    list,
  } = conditional.metadata as IListConditionalData
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null

  return (
    <DropdownButton
      fullWidth
      size="small"
      sx={{ borderRadius: 0 }}
      color={value ? 'success' : 'primary'}
      title={
        <>
          {evalIfFunc(label, calc, value)}{' '}
          <Badge>{evalIfFunc(badge, calc, value)}</Badge>
        </>
      }
      disabled={disabled}
    >
      <Divider />
      {['0', ...list].map((val, ind) => (
        <MenuItem
          key={val}
          onClick={() => setValue(ind)}
          selected={value === ind}
          disabled={value === ind}
        >
          {evalIfFunc(label, calc, ind)}
          <Badge>{evalIfFunc(badge, calc, ind)}</Badge>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

function NumConditional({
  conditional,
  setValue,
  value,
  disabled,
}: ConditionalProps) {
  const calc = useContext(CalcContext)
  const { label, badge } = conditional
  const {
    sheet: sheetKey,
    name: condKey,
    int_only,
    min,
    max,
  } = conditional.metadata as INumConditionalData
  if (!sheetKey || !condKey) throw new Error('metadata missing')
  if (!calc) return null

  const labelEle = evalIfFunc(label, calc, value)
  const badgeEle = evalIfFunc(badge, calc, value)
  if (typeof min === 'undefined' || typeof max === 'undefined')
    return (
      <NumberInputLazy
        fullWidth
        float={!int_only}
        inputProps={{ min, max }}
        InputProps={{
          startAdornment: labelEle && <Box sx={{ mr: 1 }}>{labelEle}</Box>,
          endAdornment: <Badge>{evalIfFunc(badge, calc, value)}</Badge>,
        }}
        value={value}
        onChange={(newVal) => setValue(newVal)}
        disabled={disabled}
      />
    )
  return (
    <Box sx={{ px: 2 }}>
      {(labelEle || badge) && (
        <Typography display="flex" justifyContent="space-between">
          {labelEle} {<Badge>{badgeEle}</Badge>}
        </Typography>
      )}
      <CondSlider
        max={max}
        min={min}
        value={value}
        // onChange={(_e, v) => setInnerValue(v as number)}
        onChangeCommitted={(_e, v) => setValue(v as number)}
        valueLabelDisplay="auto"
        disabled={disabled}
      />
    </Box>
  )
}
function CondSlider(props: Omit<SliderProps, 'onChange'>) {
  const [innerValue, setInnerValue] = useState(props.value)
  return (
    <Slider
      {...props}
      onChange={(_e, v) => setInnerValue(v as number)}
      value={innerValue}
    />
  )
}

function CondSrcDst<S extends string, D extends string>({
  src,
  srcDisplay,
  setSrc,
  dst,
  dstDisplay,
  setDst,
}: {
  src: S | null
  srcDisplay: Record<S, ReactNode>
  setSrc?: (src: S | null) => void
  dst: D | null
  dstDisplay: Record<D, ReactNode>
  setDst?: (dst: D | null) => void
}) {
  if (!Object.keys(srcDisplay).length || !Object.keys(dstDisplay).length)
    return null
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <SrcDstDisplay target={src} targetMap={srcDisplay} setTarget={setSrc} />
      <ArrowRightAltIcon />
      <SrcDstDisplay target={dst} targetMap={dstDisplay} setTarget={setDst} />
    </Box>
  )
}

function SrcDstDisplay<T extends string>({
  target,
  targetMap,
  setTarget,
}: {
  target: T | null
  targetMap: Record<T, ReactNode>
  setTarget?: (t: T | null) => void
}) {
  if (setTarget)
    return (
      <SrcDstDropDown
        target={target}
        targetMap={targetMap}
        onChange={setTarget}
      />
    )
  if (target) return targetMap[target]
  return 'All'
}

function SrcDstDropDown<K extends string>({
  target,
  targetMap,
  onChange,
}: {
  target: K | null
  targetMap: Record<K, ReactNode>
  onChange: (target: K | null) => void
}) {
  const onlyOption = Object.keys(targetMap).length === 1
  // TODO: Translate
  return (
    <DropdownButton
      title={target ? targetMap[target] : 'All'}
      disabled={onlyOption}
    >
      <MenuItem key="all" onClick={() => onChange(null)}>
        All
      </MenuItem>
      {Object.entries(targetMap).map(([key, display]) => (
        <MenuItem key={key} onClick={() => onChange(key as K)}>
          {display}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
