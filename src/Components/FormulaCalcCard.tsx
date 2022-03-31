import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, CardContent, CardHeader, Collapse, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useState } from "react"
import { DataContext } from "../DataContext"
import { getDisplayHeader, getDisplaySections } from "../Formula/DisplayUtil"
import { DisplaySub } from "../Formula/type"
import { NodeDisplay } from "../Formula/uiData"
import KeyMap, { valueString } from "../KeyMap"
import usePromise from "../ReactHooks/usePromise"
import CardDark from "./Card/CardDark"
import CardLight from "./Card/CardLight"
import ColorText from "./ColoredText"
import ExpandButton from "./ExpandButton"
import ImgIcon from "./Image/ImgIcon"

import { diff_debug } from "../Formula/differentiate"

export default function FormulaCalcCard() {
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(() => setexpanded(!expanded), [setexpanded, expanded])
  return <CardLight>
    <CardContent>
      <Grid container>
        <Grid item flexGrow={1}>
          <Typography>Formulas {"&"} Calculations</Typography>
          <Typography variant="caption" color="text.secondary">Expand to see every formula and all their calculations.</Typography>
        </Grid>
        <Grid item>
          <ExpandButton
            expand={expanded}
            onClick={toggle}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ExpandMore />
          </ExpandButton>
        </Grid>
      </Grid>
    </CardContent>
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ pt: 0 }}>
        <CalculationDisplay />
      </CardContent>
    </Collapse>
  </CardLight>
}

function CalculationDisplay() {
  const { data } = useContext(DataContext)
  const sections = getDisplaySections(data)

  // console.log('here??', data)
  diff_debug()

  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />} >
    <Box sx={{ mr: -1, mb: -1 }}>
      {sections.map(([key, Nodes]) =>
        <FormulaCalc key={key} displayNs={Nodes} sectionKey={key} />)}
    </Box>
  </Suspense>
}
function FormulaCalc({ sectionKey, displayNs }: { displayNs: DisplaySub<NodeDisplay>, sectionKey: string }) {
  const { data } = useContext(DataContext)
  const header = usePromise(getDisplayHeader(data, sectionKey), [data, sectionKey])
  if (!header) return null
  const { title, icon, action } = header
  return <CardDark sx={{ mb: 1 }}>
    <CardHeader avatar={icon && <ImgIcon size={2} sx={{ m: -1 }} src={icon} />} title={title} action={action} titleTypographyProps={{ variant: "subtitle1" }} />
    <Divider />
    <CardContent>
      {Object.entries(displayNs).map(([key, node]) =>
        !node.isEmpty && <Accordion sx={{ bgcolor: "contentLight.main" }} key={key}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography><ColorText color={node.variant}>{KeyMap.get(node.key ?? "")}</ColorText> <strong>{valueString(node.value, node.unit)}</strong></Typography>
          </AccordionSummary>
          <AccordionDetails>
            {node.formulas.map((subform, i) => <Typography key={i}>{subform}</Typography>)}
          </AccordionDetails>
        </Accordion>)}
    </CardContent>
  </CardDark>
}
