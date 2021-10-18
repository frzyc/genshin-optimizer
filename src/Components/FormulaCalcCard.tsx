import { ExpandMore } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Box, CardContent, Collapse, Divider, Grid, Skeleton, Typography } from "@mui/material"
import { Suspense, useCallback, useContext, useMemo, useState } from "react"
import { ArtifactSheet } from "../Artifact/ArtifactSheet"
import { buildContext } from "../Build/Build"
import Character from "../Character/Character"
import CharacterSheet from "../Character/CharacterSheet"
import { getFormulaTargetsDisplayHeading } from "../Character/CharacterUtil"
import Formula from "../Formula"
import usePromise from "../ReactHooks/usePromise"
import Stat, { FormulaDisplay } from "../Stat"
import { GetDependencies } from "../StatDependency"
import { ArtifactSetKey } from "../Types/consts"
import { IFieldDisplay } from "../Types/IFieldDisplay"
import { ICalculatedStats } from "../Types/stats"
import WeaponSheet from "../Weapon/WeaponSheet"
import CardDark from "./Card/CardDark"
import CardLight from "./Card/CardLight"
import ColorText from "./ColoredText"
import ExpandButton from "./ExpandButton"

export default function FormulaCalcCard({ sheets }: {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  }
}) {
  const [expanded, setexpanded] = useState(false)
  const toggle = useCallback(() => setexpanded(!expanded), [setexpanded, expanded])
  const { newBuild, equippedBuild } = useContext(buildContext)
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild!
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
        <CalculationDisplay sheets={sheets} build={build} />
      </CardContent>
    </Collapse>
  </CardLight>
}

function CalculationDisplay({ sheets, build }: {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  },
  build: ICalculatedStats
}) {
  const displayStatKeys = useMemo(() => build && Character.getDisplayStatKeys(build, sheets), [build, sheets])
  if (!build) return null
  return <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />} >
    {Object.entries(displayStatKeys).map(([sectionKey, fields]: [string, any]) => {
      const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build.characterEle)
      return <CardDark key={sectionKey} sx={{ mb: 1 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6">{header}</Typography>
        </CardContent>
        <Divider />
        <CardContent>
          {fields.map((field, fieldIndex) => {
            if (Array.isArray(field))
              return <FormulaCalculationField key={fieldIndex} fieldKeys={field} build={build} />
            else if (typeof field === "string") {//simple statKey field
              const subFormulaKeys: any[] = Stat.getPrintableFormulaStatKeyList(GetDependencies(build, build?.modifiers, [field]), build?.modifiers).reverse()
              return Boolean(subFormulaKeys.length) && <Accordion sx={{ bgcolor: "contentLight.main" }} key={fieldIndex}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{Stat.printStat(field, build)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {subFormulaKeys.map(subKey =>
                    <Typography key={subKey}>{Stat.printStat(subKey, build)} = <small><FormulaDisplay statKey={subKey} stats={build} modifiers={build.modifiers} expand={false} /></small></Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            }
            return null
          })}
        </CardContent>
      </CardDark>
    })}
  </Suspense>
}

function FormulaCalculationField({ fieldKeys, build }: { fieldKeys: string[], build: ICalculatedStats }) {
  const formula = usePromise(Formula.get(fieldKeys), [fieldKeys])
  if (!formula) return null
  const formulaField = (formula as any).field as IFieldDisplay
  const fieldText = Character.getTalentFieldValue(formulaField, "text", build)
  const fieldVariant = Character.getTalentFieldValue(formulaField, "variant", build)
  const fieldFormulaText = Character.getTalentFieldValue(formulaField, "formulaText", build)
  const fieldFixed = Character.getTalentFieldValue(formulaField, "fixed", build) ?? 0
  const fieldUnit = Character.getTalentFieldValue(formulaField, "unit", build) ?? ""
  const [fieldFormula, fieldFormulaDependency] = Character.getTalentFieldValue(formulaField, "formula", build, [] as any)
  if (!fieldFormula || !fieldFormulaDependency) return null
  const fieldValue = fieldFormula?.(build)?.toFixed?.(fieldFixed)
  const subFormulaKeys = Stat.getPrintableFormulaStatKeyList(GetDependencies(build, build?.modifiers, fieldFormulaDependency), build?.modifiers).reverse()
  return <Accordion sx={{ bgcolor: "contentLight.main" }}>
    <AccordionSummary expandIcon={<ExpandMore />}>
      <Typography><Box color={`${fieldVariant}.main`} component="strong">{fieldText}</Box> <ColorText color="info">{fieldValue}{fieldUnit}</ColorText></Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography><Box color={`${fieldVariant}.main`} component="strong">{fieldText}</Box> <ColorText color="info">{fieldValue}</ColorText> = <small>{fieldFormulaText}</small></Typography>
      {subFormulaKeys.map(subKey =>
        <Typography key={subKey}>{Stat.printStat(subKey, build)} = <small><FormulaDisplay statKey={subKey} stats={build} modifiers={build.modifiers} expand={false} /></small></Typography>
      )}
    </AccordionDetails>
  </Accordion>
}