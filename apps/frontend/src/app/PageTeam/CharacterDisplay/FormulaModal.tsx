import type { AmpReactionKey } from '@genshin-optimizer/gi/consts'
import { allAmpReactionKeys } from '@genshin-optimizer/gi/consts'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ExpandMore } from '@mui/icons-material'
import CloseIcon from '@mui/icons-material/Close'
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
import AmpReactionModeText from '../../Components/AmpReactionModeText'
import CardDark from '../../Components/Card/CardDark'
import CardHeaderCustom from '../../Components/Card/CardHeaderCustom'
import CardLight from '../../Components/Card/CardLight'
import ColorText from '../../Components/ColoredText'
import ImgIcon from '../../Components/Image/ImgIcon'
import ModalWrapper from '../../Components/ModalWrapper'
import SqBadge from '../../Components/SqBadge'
import { DataContext } from '../../Context/DataContext'
import { FormulaDataContext } from '../../Context/FormulaDataContext'
import { getDisplayHeader, getDisplaySections } from '../../Formula/DisplayUtil'
import type { DisplaySub } from '../../Formula/type'
import type { NodeDisplay } from '../../Formula/uiData'
import { nodeVStr } from '../../Formula/uiData'
export default function FormulaModal() {
  const { modalOpen } = useContext(FormulaDataContext)
  const { setFormulaData } = useContext(FormulaDataContext)
  const onCloseHandler = useCallback(
    () => setFormulaData?.(undefined, undefined),
    [setFormulaData]
  )
  return (
    <ModalWrapper open={!!modalOpen} onClose={onCloseHandler}>
      <CardDark>
        <CardHeader
          title="Formulas & Calculations"
          action={
            <IconButton onClick={onCloseHandler}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent sx={{ pt: 0 }}>
          <CalculationDisplay />
        </CardContent>
      </CardDark>
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
  displayNs: DisplaySub<NodeDisplay>
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
    <CardLight sx={{ mb: 1 }}>
      <CardHeaderCustom
        avatar={icon && <ImgIcon size={2} src={icon} />}
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
    </CardLight>
  )
}
function FormulaAccordian({ node }: { node: NodeDisplay }) {
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

  return (
    <Accordion
      sx={{ bgcolor: 'contentNormal.main' }}
      expanded={node === contextNode || expanded}
      onChange={handleChange}
      ref={scrollRef}
    >
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography>
          <ColorText color={node.info.variant}>{node.info.name}</ColorText>{' '}
          <strong>{nodeVStr(node)}</strong>
        </Typography>
        {allAmpReactionKeys.includes(
          node.info.variant as 'vaporize' | 'melt'
        ) && (
          <Box sx={{ display: 'inline-block', ml: 'auto', mr: 2 }}>
            <AmpReactionModeText
              reaction={node.info.variant as AmpReactionKey}
              trigger={
                node.info.subVariant as 'cryo' | 'pyro' | 'hydro' | undefined
              }
            />
          </Box>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {node.formulas.map((subform, i) => (
          <Typography key={i} component="div">
            {subform}
          </Typography>
        ))}
      </AccordionDetails>
    </Accordion>
  )
}
