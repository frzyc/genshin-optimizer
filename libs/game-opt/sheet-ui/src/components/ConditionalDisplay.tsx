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
import type { Conditional } from '../types'
import { FieldsDisplay } from './FieldDisplay'
import { HeaderDisplay } from './HeaderDisplay'

export const ConditionalValuesContext = createContext<Array<CondValue>>([])
type CondValue = {
  sheet: string
  condKey: string
  condValue: number
  src: string
  dst: string | null
}
export function ConditionalsDisplay({
  conditional,
  bgt,
}: {
  bgt?: CardBackgroundColor
  conditional: Conditional
}) {
  const { srcDisplay, dstDisplay } = useContext(SrcDstDisplayContext)
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
    (src: string, dst: string | null) =>
      filteredConditionals.some(({ src: s, dst: d }) => s === src && d === dst),
    [filteredConditionals]
  )

  const [src, setSrc] = useState<string>(Object.keys(srcDisplay)[0])
  const [dst, setDst] = useState<string>(Object.keys(dstDisplay)[0])
  return (
    <Stack spacing={1}>
      {filteredConditionals.map(({ src, dst, condValue }) => (
        <ConditionalDisplay
          key={src + dst}
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
          dst={dst === 'all' ? null : dst}
          setDst={setDst}
          value={0}
          setValue={(v) =>
            setConditional(sheet, name, src, dst === 'all' ? null : dst, v)
          }
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
  src: string,
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
  src: string
  setSrc?: (src: string) => void
  dst: string | null
  setDst?: (dst: string) => void
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
          dst={dst!} //TODO
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
  src: S
  srcDisplay: Record<S, ReactNode>
  setSrc?: (src: S) => void
  dst: D
  dstDisplay: Record<D, ReactNode>
  setDst?: (dst: D) => void
}) {
  if (!Object.keys(srcDisplay).length || !Object.keys(dstDisplay).length)
    return null
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      {setSrc ? (
        <SrcDstDropDown
          target={src ?? Object.keys(srcDisplay)[0]}
          targetMap={srcDisplay}
          onChange={setSrc}
        />
      ) : (
        srcDisplay[src]
      )}
      <ArrowRightAltIcon />
      {setDst ? (
        <SrcDstDropDown
          target={dst ?? Object.keys(dstDisplay)[0]}
          targetMap={dstDisplay}
          onChange={setDst}
        />
      ) : (
        dstDisplay[dst]
      )}
    </Box>
  )
}

function SrcDstDropDown<K extends string>({
  target,
  targetMap,
  onChange,
}: {
  target: K
  targetMap: Record<K, ReactNode>
  onChange: (target: K) => void
}) {
  const onlyOption = Object.keys(targetMap).length === 1
  return (
    <DropdownButton title={targetMap[target]} disabled={onlyOption}>
      {Object.entries(targetMap).map(([key, display]) => (
        <MenuItem key={key} onClick={() => onChange(key as K)}>
          {display}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
