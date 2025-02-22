import {
  CardHeaderCustom,
  CardThemed,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type { AmpReactionKey } from '@genshin-optimizer/gi/consts'
import { allAmpReactionKeys } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import {
  AmpReactionModeText,
  DataContext,
  FormulaDataContext,
  GetCalcDisplay,
  getDisplayHeader,
  getDisplaySections,
  resolveInfo,
} from '@genshin-optimizer/gi/ui'
import type { CalcResult } from '@genshin-optimizer/gi/uidata'
import type { DisplaySub } from '@genshin-optimizer/gi/wr'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material'
import type { MutableRefObject } from 'react'
import {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
export default function FormulaModal() {
  const { t } = useTranslation('loadout')
  const { modalOpen } = useContext(FormulaDataContext)
  const { setFormulaData } = useContext(FormulaDataContext)
  const onCloseHandler = useCallback(
    () => setFormulaData?.(undefined, undefined),
    [setFormulaData]
  )
  return (
    <ModalWrapper open={!!modalOpen} onClose={onCloseHandler}>
      <CardThemed>
        <CardHeader
          title={t('showFormulas.title')}
          action={
            <IconButton onClick={onCloseHandler}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <CalculationDisplay />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function CalculationDisplay() {
  const { data } = useContext(DataContext)
  const { data: contextData } = useContext(FormulaDataContext)
  const sections = getDisplaySections(contextData ?? data)
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
    >
      <Box sx={{ mr: -1, mb: -1 }}>
        {sections.map(([key, Nodes]) => (
          <FormulaCalc key={key} displayNs={Nodes} sectionKey={key} />
        ))}
      </Box>
    </Suspense>
  )
}
function FormulaCalc({
  sectionKey,
  displayNs,
}: {
  displayNs: DisplaySub<CalcResult>
  sectionKey: string
}) {
  const { data } = useContext(DataContext)
  const database = useDatabase()
  const { data: contextData } = useContext(FormulaDataContext)
  const header = useMemo(
    () => getDisplayHeader(contextData ?? data, sectionKey, database),
    [database, contextData, data, sectionKey]
  )
  if (!header) return null
  if (Object.entries(displayNs).every(([_, node]) => node.isEmpty)) return null
  const { title, icon, action } = header
  return (
    <CardThemed bgt="light" sx={{ mb: 1 }}>
      <CardHeaderCustom
        avatar={icon}
        title={title}
        action={action && <SqBadge>{action}</SqBadge>}
      />
      <Divider />
      <CardContent>
        {Object.entries(displayNs).map(
          ([key, node]) =>
            !node.isEmpty && <FormulaAccordian key={key} node={node} />
        )}
      </CardContent>
    </CardThemed>
  )
}
function FormulaAccordian({ node }: { node: CalcResult }) {
  const { node: contextNode } = useContext(FormulaDataContext)
  const [expanded, setExpanded] = useState(false)
  const handleChange = useCallback(
    (e: React.SyntheticEvent, isExpanded: boolean) => setExpanded(isExpanded),
    []
  )
  const scrollRef =
    useRef<HTMLDivElement>() as MutableRefObject<HTMLDivElement | null>

  useEffect(() => {
    if (node === contextNode)
      setTimeout(
        () => scrollRef?.current?.scrollIntoView?.({ behavior: 'smooth' }),
        300
      )
  }, [scrollRef, node, contextNode])

  const { variant, subVariant } = resolveInfo(node.info)
  const calcDisplay = GetCalcDisplay(node)
  return (
    <Accordion
      sx={{ bgcolor: 'contentNormal.main' }}
      expanded={node === contextNode || expanded}
      onChange={handleChange}
      ref={scrollRef}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>
          {calcDisplay.name}
          <strong>{calcDisplay.valueString}</strong>
        </Typography>
        {allAmpReactionKeys.includes(variant as 'vaporize' | 'melt') && (
          <Box sx={{ display: 'inline-block', ml: 'auto', mr: 2 }}>
            <AmpReactionModeText
              reaction={variant as AmpReactionKey}
              trigger={subVariant as 'cryo' | 'pyro' | 'hydro' | undefined}
            />
          </Box>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {calcDisplay.assignment}
        {calcDisplay.formulas.map((subform, i) => (
          <Typography key={i} component="div">
            {subform}
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  )
}
