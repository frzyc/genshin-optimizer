import { faCheckSquare, faSquare, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from 'react';
import { Accordion, AccordionContext, Button, Card, Col, Image, Row, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import Assets from "../../Assets/Assets";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import { GetDependencies } from "../../StatDependency";
import Character from "../Character";
import StatInput from "../StatInput";

function ReactionToggle({ character: { characterKey, reactionMode = "none" }, setReactionMode, className }) {
  reactionMode === null && (reactionMode = "none")
  let charEleKey = Character.getElementalKey(characterKey)
  let eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && Character.getWeaponTypeKey(characterKey) === "claymore") eleInterArr.push("shattered_hit")
  return ["pyro", "hydro", "cryo"].includes(charEleKey) && <ToggleButtonGroup className={className}
    type="radio" name="reactionMode" defaultValue={reactionMode} onChange={(val) => setReactionMode(val === "none" ? null : val)}>
    <ToggleButton value={"none"} variant={reactionMode === "none" ? "success" : "primary"}>No Reactions</ToggleButton >
    {charEleKey === "pyro" && <ToggleButton value={"pyro_vaporize"} variant={reactionMode === "pyro_vaporize" ? "success" : "primary"}>
      <span className="text-vaporize">Vaporize(Pyro) <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /></span>
    </ToggleButton >}
    {charEleKey === "pyro" && <ToggleButton value={"pyro_melt"} variant={reactionMode === "pyro_melt" ? "success" : "primary"}>
      <span className="text-melt">Melt(Pyro) <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /></span>
    </ToggleButton >}
    {charEleKey === "hydro" && <ToggleButton value={"hydro_vaporize"} variant={reactionMode === "hydro_vaporize" ? "success" : "primary"}>
      <span className="text-vaporize">Vaporize(Hydro) <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /></span>
    </ToggleButton >}
    {charEleKey === "cryo" && <ToggleButton value={"cryo_melt"} variant={reactionMode === "cryo_melt" ? "success" : "primary"}>
      <span className="text-melt">Melt(Cryo) <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /></span>
    </ToggleButton >}
  </ToggleButtonGroup>
}
function HitModeToggle({ hitMode, setHitMode, className }) {
  return <ToggleButtonGroup type="radio" value={hitMode} name="hitOptions" onChange={setHitMode} className={className}>
    <ToggleButton value="avgHit" variant={hitMode === "avgHit" ? "success" : "primary"}>Avg. DMG</ToggleButton>
    <ToggleButton value="hit" variant={hitMode === "hit" ? "success" : "primary"}>Normal Hit, No Crit</ToggleButton>
    <ToggleButton value="critHit" variant={hitMode === "critHit" ? "success" : "primary"}>Crit Hit DMG</ToggleButton>
  </ToggleButtonGroup>
}

export default function DamageOptionsAndCalculation({ character, character: { characterKey, hitMode }, setState, setOverride, newBuild, equippedBuild }) {
  //choose which one to display stats for
  const build = newBuild ? newBuild : equippedBuild

  const ContextAwareToggle = ({ eventKey, callback }) => {
    const currentEventKey = useContext(AccordionContext);
    const decoratedOnClick = useAccordionToggle(
      eventKey,
      () => callback && callback(eventKey),
    );
    const expanded = currentEventKey === eventKey;
    return (
      <Button onClick={decoratedOnClick} >
        <FontAwesomeIcon icon={expanded ? faWindowMinimize : faWindowMaximize} className={`fa-fw ${expanded ? "fa-rotate-180" : ""}`} />
        <span> </span>{expanded ? "Retract" : "Expand"}
      </Button>
    );
  }
  const statsDisplayKeys = () => {
    let keys = ["finalHP", "finalATK", "finalDEF"]
    //we need to figure out if the character has: normal phy auto, elemental auto, infusable auto(both normal and phy)
    let isAutoElemental = Character.isAutoElemental(characterKey)
    let isAutoInfusable = Character.isAutoInfusable(characterKey)
    let autoKeys = ["normal", "charged", "plunging"];
    let talKeys = ["ele", "skill", "burst"];
    if (!isAutoElemental)  //add physical variants of the formulas
      autoKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character)))
    if (isAutoElemental || (isAutoInfusable && character.autoInfused))
      autoKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character, true)))
    else if (Character.getWeaponTypeKey(characterKey) === "bow")//bow charged atk does elemental dmg on charge
      keys.push(Character.getTalentStatKey("charged", character, true))
    //add talents/skills
    talKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character)))
    //show elemental interactions
    keys.push(...(ElementToReactionKeys[Character.getElementalKey(characterKey)] || []))
    let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
    if (!keys.includes("shattered_hit") && weaponTypeKey === "claymore") keys.push("shattered_hit")

    //search for dependency
    return Stat.getPrintableFormulaStatKeyList(GetDependencies(build?.finalStats?.modifiers, keys), build?.finalStats?.modifiers)
  }
  return <Accordion>
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span className="d-block">Damage Calculation Options</span>
            <small>Expand below to edit enemy details.</small>
          </Col>
          <Col xs="auto">
            {/* TODO reaction interaction UI */}
            <ReactionToggle {...{ character, setReactionMode: r => setState({ reactionMode: r }) }} />
          </Col>
          <Col xs="auto">
            <ContextAwareToggle as={Button} eventKey="1" />
          </Col>
        </Row>
      </Card.Header>
      <Accordion.Collapse eventKey="1">
        <Card.Body>
          <Row className="mb-2"><Col>
            <Button variant="warning" >
              <a href="https://genshin-impact.fandom.com/wiki/Damage#Base_Enemy_Resistances" target="_blank" rel="noreferrer">
                To get the specific resistance values of enemies, please visit the wiki.
          </a>
            </Button >
          </Col></Row>
          <Row>
            <Col xs={12} xl={6} className="mb-2">
              <StatInput
                name={<b>Enemy Level</b>}
                value={Character.getStatValueWithOverride(character, "enemyLevel")}
                placeholder={Stat.getStatNameRaw("enemyLevel")}
                defaultValue={Character.getBaseStatValue(character, "enemyLevel")}
                onValueChange={(val) => setOverride?.("enemyLevel", val)}
              />
            </Col>
            {Character.getElementalKeys().map(eleKey => {
              let statKey = eleKey === "physical" ? "physical_enemyRes_" : `${eleKey}_enemyRes_`
              let immunityStatKey = eleKey === "physical" ? "physical_enemyImmunity" : `${eleKey}_enemyImmunity`
              let elementImmunity = Character.getStatValueWithOverride(character, immunityStatKey)
              return <Col xs={12} xl={6} key={eleKey} className="mb-2">
                <StatInput
                  prependEle={<Button variant={eleKey} onClick={() => setOverride(immunityStatKey, !elementImmunity)} className="text-darkcontent">
                    <FontAwesomeIcon icon={elementImmunity ? faCheckSquare : faSquare} className="fa-fw" /> Immunity
                </Button>}
                  name={<b>{Stat.getStatNameRaw(statKey)}</b>}
                  value={Character.getStatValueWithOverride(character, statKey)}
                  placeholder={Stat.getStatNameRaw(statKey)}
                  defaultValue={Character.getBaseStatValue(character, statKey)}
                  onValueChange={(val) => setOverride?.(statKey, val)}
                  disabled={elementImmunity}
                />
              </Col>
            })}
          </Row>
        </Card.Body>
      </Accordion.Collapse>
    </Card>

    <Card bg="lightcontent" text="lightfont">
      <Card.Header>
        <Row>
          <Col>
            <span className="d-block">Damage Calculation Formulas</span>
            <small>Expand below to see calculation details.</small>
          </Col>
          <Col xs="auto">
            <HitModeToggle {...{ hitMode, setHitMode: m => setState({ hitMode: m }) }} />
          </Col>
          <Col xs="auto">
            <ContextAwareToggle as={Button} eventKey="2" />
          </Col>
        </Row>
      </Card.Header>
      <Accordion.Collapse eventKey="2">
        <Card.Body>
          <Row>
            {statsDisplayKeys().map(key => <Col key={key} xs={12} className="mb-2">
              <Card bg="darkcontent" text="lightfont">
                <Card.Header className="p-2">
                  {Stat.printStat(key, build.finalStats)}
                </Card.Header>
                <Card.Body className="p-2">
                  <small>{Stat.printFormula(key, build.finalStats, build.finalStats.modifiers, false)}</small>
                </Card.Body>
              </Card>
            </Col>
            )}
          </Row>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  </Accordion>
}
export {
  HitModeToggle,
  ReactionToggle,
}