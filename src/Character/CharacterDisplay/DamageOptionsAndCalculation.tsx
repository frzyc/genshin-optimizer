import { faCheckSquare, faSquare, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo } from 'react';
import { Accordion, AccordionContext, Button, Card, Col, Dropdown, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import { ArtifactSheet } from "../../Artifact/ArtifactSheet";
import { buildContext } from "../../Build/Build";
import StatIcon, { uncoloredEleIcons } from "../../Components/StatIcon";
import Formula from "../../Formula";
import Stat, { FormulaDisplay } from "../../Stat";
import { GetDependencies } from "../../StatDependency";
import { ICachedCharacter } from "../../Types/character";
import { allElements, ArtifactSetKey } from "../../Types/consts";
import { IFieldDisplay } from "../../Types/IFieldDisplay";
import { ICalculatedStats } from "../../Types/stats";
import { usePromise } from "../../Util/ReactUtil";
import WeaponSheet from "../../Weapon/WeaponSheet";
import Character from "../Character";
import type { characterReducerAction } from "../CharacterDisplayCard";
import CharacterSheet from "../CharacterSheet";
import { getFormulaTargetsDisplayHeading } from "../CharacterUtil";
import StatInput from "../StatInput";
const infusionVals = {
  "": <span>No External Infusion</span>,
  "pyro": <span >{uncoloredEleIcons.pyro} Pyro Infusion</span>,
  "cryo": <span >{uncoloredEleIcons.cryo} Cryo Infusion</span>,
}
type InfusionAuraDropdownProps = {
  characterSheet: CharacterSheet,
  character: ICachedCharacter,
  characterDispatch: (any: characterReducerAction) => void,
  className?: string
  disabled?: boolean
}
export function InfusionAuraDropdown({ characterSheet, character: { infusionAura = "" }, characterDispatch, className, disabled = false }: InfusionAuraDropdownProps) {
  if (!characterSheet.isMelee()) return null
  return <Dropdown className={className}>
    <Dropdown.Toggle variant={infusionAura || "secondary"} disabled={disabled}>{infusionVals[infusionAura]}</Dropdown.Toggle>
    <Dropdown.Menu>
      {Object.entries(infusionVals).map(([key, text]) => <Dropdown.Item key={key} className={`text-${key}`} onClick={() => characterDispatch({ infusionAura: key })}>{text}</Dropdown.Item>)}
    </Dropdown.Menu>
  </Dropdown>
}

type ReactionToggleProps = {
  character: ICachedCharacter,
  build: ICalculatedStats,
  characterDispatch: (any: characterReducerAction) => void,
  className: string
  disabled?: boolean
}
export function ReactionToggle({ character: { reactionMode = null, infusionAura }, build, characterDispatch, className, disabled = false }: ReactionToggleProps) {
  if (!build) return null
  const charEleKey = build.characterEle
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusionAura)) return null
  const v = s => s ? "success" : "secondary"
  return <ToggleButtonGroup className={className} type="radio" name="reactionMode" value={reactionMode} onChange={val => characterDispatch({ reactionMode: val === "none" ? null : val })}>
    <ToggleButton value={"none"} variant={v(!reactionMode)} disabled={disabled}>No Reactions</ToggleButton >
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value={"pyro_vaporize"} variant={v(reactionMode === "pyro_vaporize")} disabled={disabled}>
      <span className="text-vaporize">Vaporize(Pyro) {StatIcon.hydro}+{StatIcon.pyro}</span>
    </ToggleButton >}
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value={"pyro_melt"} variant={v(reactionMode === "pyro_melt")} disabled={disabled}>
      <span className="text-melt">Melt(Pyro) {StatIcon.cryo}+{StatIcon.pyro}</span>
    </ToggleButton >}
    {(charEleKey === "hydro" || infusionAura === "hydro") && <ToggleButton value={"hydro_vaporize"} variant={v(reactionMode === "hydro_vaporize")} disabled={disabled}>
      <span className="text-vaporize">Vaporize(Hydro) {StatIcon.pyro}+{StatIcon.hydro}</span>
    </ToggleButton >}
    {(charEleKey === "cryo" || infusionAura === "cryo") && <ToggleButton value={"cryo_melt"} variant={v(reactionMode === "cryo_melt")} disabled={disabled}>
      <span className="text-melt">Melt(Cryo) {StatIcon.pyro}+{StatIcon.cryo}</span>
    </ToggleButton >}
  </ToggleButtonGroup>
}
export function HitModeToggle({ hitMode, characterDispatch, className, disabled = false }) {
  const v = s => s ? "success" : "secondary"
  return <ToggleButtonGroup type="radio" value={hitMode} name="hitOptions" onChange={m => characterDispatch({ hitMode: m })} className={className} >
    <ToggleButton value="avgHit" variant={v(hitMode === "avgHit")} disabled={disabled} >Avg. DMG</ToggleButton>
    <ToggleButton value="hit" variant={v(hitMode === "hit")} disabled={disabled} >Non Crit DMG</ToggleButton>
    <ToggleButton value="critHit" variant={v(hitMode === "critHit")} disabled={disabled} >Crit Hit DMG</ToggleButton>
  </ToggleButtonGroup>
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
  return <div>
    {Object.entries(displayStatKeys).map(([sectionKey, fields]: [string, any]) => {
      const header = getFormulaTargetsDisplayHeading(sectionKey, sheets, build.characterEle)
      return <Card bg="darkcontent" text={"lightfont" as any} key={sectionKey} className="w-100 mb-2">
        <Card.Header>{header}</Card.Header>
        <Card.Body className="p-2">
          <Accordion className="mb-n2">
            {fields.map((field, fieldIndex) => {
              if (Array.isArray(field))
                return <FormulaCalculationField key={fieldIndex} fieldKeys={field} build={build} fieldIndex={fieldIndex} />
              else if (typeof field === "string") {//simple statKey field
                const subFormulaKeys: any[] = Stat.getPrintableFormulaStatKeyList(GetDependencies(build, build?.modifiers, [field]), build?.modifiers).reverse()
                return Boolean(subFormulaKeys.length) && <Card key={fieldIndex} bg="lightcontent" text={"lightfont" as any} className="mb-2">
                  <Accordion.Toggle as={Card.Header} className="p-2 cursor-pointer" variant="link" eventKey={`field${fieldIndex}`}>
                    {Stat.printStat(field, build)}
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={`field${fieldIndex}`}>
                    <Card.Body className="p-2">
                      <div className="mb-n2">
                        {subFormulaKeys.map(subKey =>
                          <p className="mb-2" key={subKey}>{Stat.printStat(subKey, build)} = <small><FormulaDisplay statKey={subKey} stats={build} modifiers={build.modifiers} expand={false} /></small></p>
                        )}
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              }
              return null
            })}
          </Accordion>
        </Card.Body>
      </Card>
    })}
  </div>
}
function FormulaCalculationField({ fieldKeys, build, fieldIndex }: { fieldKeys: string[], build: ICalculatedStats, fieldIndex: number, }) {
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
  return <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
    <Accordion.Toggle as={Card.Header} className="p-2 cursor-pointer" variant="link" eventKey={`field${fieldIndex}`}>
      <b className={`text-${fieldVariant}`}>{fieldText}</b> <span className="text-info">{fieldValue}{fieldUnit}</span>
    </Accordion.Toggle>
    <Accordion.Collapse eventKey={`field${fieldIndex}`}>
      <Card.Body className="p-2">
        <div className="mb-n2">
          <p className="mb-2"><b className={`text-${fieldVariant}`}>{fieldText}</b> <span className="text-info">{fieldValue}</span> = <small>{fieldFormulaText}</small></p>
          {subFormulaKeys.map(subKey =>
            <p className="mb-2" key={subKey}>{Stat.printStat(subKey, build)} = <small><FormulaDisplay statKey={subKey} stats={build} modifiers={build.modifiers} expand={false} /></small></p>
          )}
        </div>
      </Card.Body>
    </Accordion.Collapse>
  </Card>
}

const ContextAwareToggle = ({ eventKey, callback }) => {
  const currentEventKey = useContext(AccordionContext);
  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );
  const expanded = currentEventKey === eventKey;
  return (
    <Button onClick={decoratedOnClick} variant="info">
      <FontAwesomeIcon icon={expanded ? faWindowMinimize : faWindowMaximize} className={`fa-fw ${expanded ? "fa-rotate-180" : ""}`} />
      <span> </span>{expanded ? "Retract" : "Expand"}
    </Button>
  );
}

type DamageOptionsAndCalculationProps = {
  sheets: {
    characterSheet: CharacterSheet
    weaponSheet: WeaponSheet,
    artifactSheets: StrictDict<ArtifactSetKey, ArtifactSheet>
  }
  character: ICachedCharacter,
  characterDispatch: (any: characterReducerAction) => void,
  className: string
}
export default function DamageOptionsAndCalculation({ sheets, sheets: { characterSheet, weaponSheet }, character, character: { hitMode }, characterDispatch, className }: DamageOptionsAndCalculationProps) {
  const { newBuild, equippedBuild } = useContext(buildContext)
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild!
  return <div className={className}>
    <Card bg="lightcontent" text={"lightfont" as any} className="mb-2">
      <Card.Header>
        <Row className="mb-n2">
          <Col xs="auto"><InfusionAuraDropdown characterSheet={characterSheet} character={character} characterDispatch={characterDispatch} className="mb-2" /></Col>
          <Col xs="auto"><HitModeToggle hitMode={hitMode} characterDispatch={characterDispatch} className="mb-2" /></Col>
          <Col xs="auto"><ReactionToggle character={character} build={build} characterDispatch={characterDispatch} className="mb-2" /></Col>
        </Row>
      </Card.Header>
    </Card>
    <Accordion >
      <Card bg="lightcontent" text={"lightfont" as any} >
        <Card.Header>
          <Row>
            <Col>
              <span className="d-block">Damage Calculation Options & Formulas</span>
              <small>Expand below to edit enemy details and view calculation details.</small>
            </Col>
            <Col xs="auto">
              <ContextAwareToggle callback={undefined} {...{ as: Button }} eventKey="details" />
            </Col>
          </Row>
        </Card.Header>
        <Accordion.Collapse eventKey="details">
          <Card.Body className="p-2">
            <Card className="mb-2" bg="darkcontent" text={"lightfont" as any}>
              <Card.Header>
                <Row>
                  <Col>Enemy Editor</Col>
                  <Col xs="auto">
                    <Button variant="warning" size="sm">
                      <a href="https://genshin-impact.fandom.com/wiki/Resistance#Base_Enemy_Resistances" target="_blank" rel="noreferrer">To get the specific resistance values of enemies, please visit the wiki.</a>
                    </Button >
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="p-2">
                <Row >
                  <Col xs={12} xl={6} className="mb-2">
                    <StatInput
                      name={<b>Enemy Level</b>}
                      value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, "enemyLevel")}
                      placeholder={Stat.getStatNameRaw("enemyLevel")}
                      defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, "enemyLevel")}
                      onValueChange={value => characterDispatch({ type: "statOverride", statKey: "enemyLevel", value })}
                    />
                  </Col>
                  {["physical", ...allElements].map(eleKey => {
                    let statKey = `${eleKey}_enemyRes_`
                    let immunityStatKey = `${eleKey}_enemyImmunity`
                    let elementImmunity = Character.getStatValueWithOverride(character, characterSheet, weaponSheet, immunityStatKey)
                    return <Col xs={12} xl={6} key={eleKey} className="mb-2">
                      <StatInput
                        prependEle={<Button variant={eleKey} onClick={() => characterDispatch({ type: "statOverride", statKey: immunityStatKey, value: !elementImmunity })} className="text-darkcontent">
                          <FontAwesomeIcon icon={elementImmunity ? faCheckSquare : faSquare} className="fa-fw" /> Immunity
                        </Button>}
                        name={<b>{Stat.getStatName(statKey)}</b>}
                        value={Character.getStatValueWithOverride(character, characterSheet, weaponSheet, statKey)}
                        placeholder={Stat.getStatNameRaw(statKey)}
                        defaultValue={Character.getBaseStatValue(character, characterSheet, weaponSheet, statKey)}
                        onValueChange={value => characterDispatch({ type: "statOverride", statKey, value })}
                        disabled={elementImmunity}
                        percent
                      />
                    </Col>
                  })}
                  <Col xs={12}><small>Note: for negative resistances due to resistance shred like Zhongli's shield (e.g. -10%), enter the RAW value (-10). GO will half the value for you in the calculations.</small></Col>
                </Row>
              </Card.Body>
            </Card>
            <CalculationDisplay sheets={sheets} build={build} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  </div>
}
