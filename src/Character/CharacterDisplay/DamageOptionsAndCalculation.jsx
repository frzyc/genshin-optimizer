import { faCheckSquare, faSquare, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo } from 'react';
import { Accordion, AccordionContext, Button, Card, Col, Dropdown, Image, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import Assets from "../../Assets/Assets";
import Stat from "../../Stat";
import { GetDependencies } from "../../StatDependency";
import Character from "../Character";
import StatInput from "../StatInput";
const infusionVals = {
  "": <span>No Infusion</span>,
  "pyro": <span >Pyro Infusion</span>,
  "cryo": <span >Cryo Infusion</span>,
}

export function InfusionAuraDropdown({ character: { infusionAura = "", characterKey }, characterDispatch, className }) {
  if (!Character.isMelee(characterKey)) return null
  return <Dropdown className={className}>
    <Dropdown.Toggle variant={infusionAura || "secondary"}>{infusionVals[infusionAura]}</Dropdown.Toggle>
    <Dropdown.Menu>
      {Object.entries(infusionVals).map(([key, text]) => <Dropdown.Item key={key} className={`text-${key}`} onClick={() => characterDispatch({ infusionAura: key })}>{text}</Dropdown.Item>)}
    </Dropdown.Menu>
  </Dropdown>
}

export function ReactionToggle({ character: { characterKey, reactionMode = "none", infusionAura }, characterDispatch, className }) {
  if (reactionMode === null) reactionMode = "none"
  let charEleKey = Character.getElementalKey(characterKey)
  if (!["pyro", "hydro", "cryo"].includes(charEleKey) && !["pyro", "hydro", "cryo"].includes(infusionAura)) return null
  return <ToggleButtonGroup className={className} type="radio" name="reactionMode" value={reactionMode} onChange={val => characterDispatch({ reactionMode: val === "none" ? null : val })}>
    <ToggleButton value={"none"} variant={reactionMode === "none" ? "success" : "primary"}>No Reactions</ToggleButton >
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value={"pyro_vaporize"} variant={reactionMode === "pyro_vaporize" ? "success" : "primary"}>
      <span className="text-vaporize">Vaporize(Pyro) <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /></span>
    </ToggleButton >}
    {(charEleKey === "pyro" || infusionAura === "pyro") && <ToggleButton value={"pyro_melt"} variant={reactionMode === "pyro_melt" ? "success" : "primary"}>
      <span className="text-melt">Melt(Pyro) <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /></span>
    </ToggleButton >}
    {(charEleKey === "hydro" || infusionAura === "hydro") && <ToggleButton value={"hydro_vaporize"} variant={reactionMode === "hydro_vaporize" ? "success" : "primary"}>
      <span className="text-vaporize">Vaporize(Hydro) <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /></span>
    </ToggleButton >}
    {(charEleKey === "cryo" || infusionAura === "cryo") && <ToggleButton value={"cryo_melt"} variant={reactionMode === "cryo_melt" ? "success" : "primary"}>
      <span className="text-melt">Melt(Cryo) <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /></span>
    </ToggleButton >}
  </ToggleButtonGroup>
}
export function HitModeToggle({ hitMode, characterDispatch, className }) {
  return <ToggleButtonGroup type="radio" value={hitMode} name="hitOptions" onChange={m => characterDispatch({ hitMode: m })} className={className}>
    <ToggleButton value="avgHit" variant={hitMode === "avgHit" ? "success" : "primary"}>Avg. DMG</ToggleButton>
    <ToggleButton value="hit" variant={hitMode === "hit" ? "success" : "primary"}>Non Crit DMG</ToggleButton>
    <ToggleButton value="critHit" variant={hitMode === "critHit" ? "success" : "primary"}>Crit Hit DMG</ToggleButton>
  </ToggleButtonGroup>
}

function CalculationDisplay({ build }) {
  const displayStatKeys = useMemo(() => Character.getDisplayStatKeys(build), [build])
  return <div>
    {Object.entries(displayStatKeys).map(([talentKey, fields]) => {
      let header = ""
      if (talentKey === "basicKeys") header = "Basic Stats"
      else if (talentKey === "genericAvgHit") header = "Generic Optimization Values"
      else if (talentKey === "transReactions") header = "Transformation Reaction"
      else header = Character.getTalentName(build.characterKey, talentKey, talentKey)
      return <Card bg="darkcontent" text="lightfont" key={talentKey} className="w-100 mb-2">
        <Card.Header>{header}</Card.Header>
        <Card.Body className="p-2">
          <Accordion className="mb-n2">
            {fields.map((field, fieldIndex) => {
              //simple statKey field
              if (typeof field === "string") {
                const subFormulaKeys = Stat.getPrintableFormulaStatKeyList(GetDependencies(build?.modifiers, [field]), build?.modifiers).reverse()
                return Boolean(subFormulaKeys.length) && <Card key={fieldIndex} bg="lightcontent" text="lightfont" className="mb-2">
                  <Accordion.Toggle as={Card.Header} className="p-2 cursor-pointer" variant="link" eventKey={`field${fieldIndex}`}>
                    {Stat.printStat(field, build)}
                  </Accordion.Toggle>
                  <Accordion.Collapse eventKey={`field${fieldIndex}`}>
                    <Card.Body className="p-2">
                      <div className="mb-n2">
                        {subFormulaKeys.map(subKey =>
                          <p className="mb-2" key={subKey}>{Stat.printStat(subKey, build)} = <small>{Stat.printFormula(subKey, build, build.modifiers, false)}</small></p>
                        )}
                      </div>
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              }
              //fields
              const talentField = Character.getTalentField(build, field.talentKey, field.sectionIndex, field.fieldIndex)
              const fieldText = Character.getTalentFieldValue(talentField, "text", build)
              const fieldVariant = Character.getTalentFieldValue(talentField, "variant", build)
              const fieldFormulaText = Character.getTalentFieldValue(talentField, "formulaText", build)
              const [fieldFormula, fieldFormulaDependency] = Character.getTalentFieldValue(talentField, "formula", build, [])
              if (!fieldFormula || !fieldFormulaDependency) return null
              const fieldValue = fieldFormula?.(build)?.toFixed?.()
              const subFormulaKeys = Stat.getPrintableFormulaStatKeyList(GetDependencies(build?.modifiers, fieldFormulaDependency), build?.modifiers).reverse()
              return <Card key={fieldIndex} bg="lightcontent" text="lightfont" className="mb-2">
                <Accordion.Toggle as={Card.Header} className="p-2 cursor-pointer" variant="link" eventKey={`field${fieldIndex}`}>
                  <b className={`text-${fieldVariant}`}>{fieldText}</b> <span className="text-info">{fieldValue}</span>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={`field${fieldIndex}`}>
                  <Card.Body className="p-2">
                    <div className="mb-n2">
                      <p className="mb-2"><b className={`text-${fieldVariant}`}>{fieldText}</b> <span className="text-info">{fieldValue}</span> = <small>{fieldFormulaText}</small></p>
                      {subFormulaKeys.map(subKey =>
                        <p className="mb-2" key={subKey}>{Stat.printStat(subKey, build)} = <small>{Stat.printFormula(subKey, build, build.modifiers, false)}</small></p>
                      )}
                    </div>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            })}
          </Accordion>
        </Card.Body>
      </Card>
    })}
  </div>
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

export default function DamageOptionsAndCalculation({ character, character: { hitMode }, characterDispatch, newBuild, equippedBuild, className }) {
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild
  return <div className={className}>
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row className="mb-n2">
          <Col xs="auto"><InfusionAuraDropdown character={character} characterDispatch={characterDispatch} className="mb-2" /></Col>
          <Col xs="auto"><HitModeToggle hitMode={hitMode} characterDispatch={characterDispatch} className="mb-2" /></Col>
          <Col xs="auto"><ReactionToggle character={character} characterDispatch={characterDispatch} className="mb-2" /></Col>
        </Row>
      </Card.Header>
    </Card>
    <Accordion >
      <Card bg="lightcontent" text="lightfont" >
        <Card.Header>
          <Row>
            <Col>
              <span className="d-block">Damage Calculation Options & Formulas</span>
              <small>Expand below to edit enemy details and view calculation details.</small>
            </Col>
            <Col xs="auto">
              <ContextAwareToggle as={Button} eventKey="details" />
            </Col>
          </Row>
        </Card.Header>
        <Accordion.Collapse eventKey="details">
          <Card.Body className="p-2">
            <Card className="mb-2" bg="darkcontent" text="lightfont">
              <Card.Header>
                <Row>
                  <Col>Enemy Editor</Col>
                  <Col xs="auto">
                    <Button variant="warning" size="sm">
                      <a href="https://genshin-impact.fandom.com/wiki/Damage#Base_Enemy_Resistances" target="_blank" rel="noreferrer">To get the specific resistance values of enemies, please visit the wiki.</a>
                    </Button >
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="p-2">
                <Row >
                  <Col xs={12} xl={6} className="mb-2">
                    <StatInput
                      name={<b>Enemy Level</b>}
                      value={Character.getStatValueWithOverride(character, "enemyLevel")}
                      placeholder={Stat.getStatNameRaw("enemyLevel")}
                      defaultValue={Character.getBaseStatValue(character, "enemyLevel")}
                      onValueChange={value => characterDispatch({ type: "statOverride", statKey: "enemyLevel", value })}
                    />
                  </Col>
                  {Character.getElementalKeys().map(eleKey => {
                    let statKey = eleKey === "physical" ? "physical_enemyRes_" : `${eleKey}_enemyRes_`
                    let immunityStatKey = eleKey === "physical" ? "physical_enemyImmunity" : `${eleKey}_enemyImmunity`
                    let elementImmunity = Character.getStatValueWithOverride(character, immunityStatKey)
                    return <Col xs={12} xl={6} key={eleKey} className="mb-2">
                      <StatInput
                        prependEle={<Button variant={eleKey} onClick={() => characterDispatch({ type: "statOverride", statKey: immunityStatKey, value: !elementImmunity })} className="text-darkcontent">
                          <FontAwesomeIcon icon={elementImmunity ? faCheckSquare : faSquare} className="fa-fw" /> Immunity
                </Button>}
                        name={<b>{Stat.getStatName(statKey)}</b>}
                        value={Character.getStatValueWithOverride(character, statKey)}
                        placeholder={Stat.getStatNameRaw(statKey)}
                        defaultValue={Character.getBaseStatValue(character, statKey)}
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
            <CalculationDisplay build={build} />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  </div>
}
