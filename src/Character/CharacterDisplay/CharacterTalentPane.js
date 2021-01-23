import { faCheckSquare, faQuestionCircle, faSquare, faWindowMaximize, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext } from 'react';
import { Accordion, AccordionContext, Button, Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, ToggleButton, ToggleButtonGroup, Tooltip } from "react-bootstrap";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import Assets from "../../Assets/Assets";
import ConditionalSelector from "../../Components/ConditionalSelector";
import Stat, { FormulaText } from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import { GetDependencies } from "../../StatDependency";
import ConditionalsUtil from "../../Util/ConditionalsUtil";
import Character from "../Character";
import StatInput from "../StatInput";

export default function CharacterTalentPane(props) {
  let { character, character: { characterKey, levelKey, constellation, dmgMode }, editable, setState, setOverride, newBuild, equippedBuild } = props
  let build = newBuild ? newBuild : equippedBuild
  //choose which one to display stats for
  let ascension = Character.getAscension(levelKey)

  let skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]

  let passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]

  let skillDisplayProps = { ...props, ascension }
  const ContextAwareToggle = ({ eventKey, callback }) => {
    const currentEventKey = useContext(AccordionContext);
    const decoratedOnClick = useAccordionToggle(
      eventKey,
      () => callback && callback(eventKey),
    );
    const expanded = currentEventKey === eventKey;
    return (
      <Button
        // style={{ backgroundColor: isCurrentEventKey ? 'pink' : 'lavender' }}
        onClick={decoratedOnClick}
      >
        <FontAwesomeIcon icon={expanded ? faWindowMinimize : faWindowMaximize} className={`fa-fw ${expanded ? "fa-rotate-180" : ""}`} />
        <span> </span>{expanded ? "Retract" : "Expand"}
      </Button>
    );
  }
  const statsDisplayKeys = () => {
    let keys = ["hp_final", "atk_final", "def_final"]
    //we need to figure out if the character has: normal phy auto, elemental auto, infusable auto(both normal and phy)
    let isAutoElemental = Character.isAutoElemental(characterKey)
    let isAutoInfusable = Character.isAutoInfusable(characterKey)
    let autoKeys = ["norm_atk", "char_atk", "plunge"];
    let talKeys = ["ele", "skill", "burst"];
    if (!isAutoElemental)  //add physical variants of the formulas
      autoKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character)))
    if (isAutoElemental || (isAutoInfusable && character.autoInfused))
      autoKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character, true)))
    else if (Character.getWeaponTypeKey(characterKey) === "bow")//bow charged atk does elemental dmg on charge
      keys.push(Character.getTalentStatKey("char_atk", character, true))
    //add talents/skills
    talKeys.forEach(key => keys.push(Character.getTalentStatKey(key, character)))
    //search for dependency, and flatten, isolate unique keys
    keys = GetDependencies(build.finalStats, keys)
    //return keys that are part of the formula text, in the order in which they appear.
    return Object.keys(FormulaText).filter(key => keys.includes(key))
  }
  return <>
    <Row><Col xs={12} className="mb-2">
      <Accordion>
        <Card bg="lightcontent" text="lightfont" className="mb-2">
          <Card.Header>
            <Row>
              <Col>
                <span className="d-block">Damage Calculation Options</span>
                <small>Expand below to edit enemy details.</small>
              </Col>
              <Col xs="auto">
                <ToggleButtonGroup type="radio" value={dmgMode} name="dmgOptions" onChange={(dmgMode) => setState({ dmgMode })}>
                  <ToggleButton value="avg_dmg">Avg. DMG</ToggleButton>
                  <ToggleButton value="dmg">Normal Hit, No Crit</ToggleButton>
                  <ToggleButton value="crit_dmg">Crit Hit DMG</ToggleButton>
                </ToggleButtonGroup>
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
                    value={Character.getStatValueWithOverride(character, "enemy_level")}
                    placeholder={Stat.getStatNameRaw("enemy_level")}
                    defaultValue={Character.getBaseStatValue(character, "enemy_level")}
                    onValueChange={(val) => setOverride("enemy_level", val)}
                  />
                </Col>
                {["physical", ...Character.getElementalKeys()].map(eleKey => {
                  let statKey = eleKey === "physical" ? "enemy_phy_res" : `${eleKey}_enemy_ele_res`
                  let immunityStatKey = eleKey === "physical" ? "enemy_phy_immunity" : `${eleKey}_enemy_ele_immunity`
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
                      onValueChange={(val) => setOverride(statKey, val)}
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
    </Col></Row>
    <Row><Col><ReactionDisplay {...props} /></Col></Row>
    <Row>
      {/* auto, skill, burst */}
      {skillBurstList.map(([tKey, tText]) =>
        <Col key={tKey} xs={12} md={6} lg={4} className="mb-2">
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={tText}
          />
        </Col>)}
      {Character.getTalent(characterKey, "sprint", false) && <Col xs={12} md={6} lg={4} className="mb-2">
        <SkillDisplayCard
          {...skillDisplayProps}
          talentKey="sprint"
          subtitle="Alternative Sprint"
        />
      </Col>}
    </Row>
    <Row>
      {/* passives */}
      {passivesList.map(([tKey, tText, asc]) => {
        let enabled = ascension >= asc
        return <Col key={tKey} style={{ opacity: enabled ? 1 : 0.5 }} xs={12} md={4} className="mb-2">
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={tText}
          />
        </Col>
      })}
    </Row>
    <Row>
      <Col>
        <h5 className="text-center">Constellation Lv. {constellation}</h5>
      </Col>
    </Row>
    <Row className="mb-n2">
      {/* constellations */}
      {[...Array(6).keys()].map(i => {
        let tKey = `constellation${i + 1}`
        return <Col key={i} xs={12} md={4} className="mb-2"
          style={{ opacity: constellation > i ? 1 : 0.5 }}>
          <SkillDisplayCard
            {...skillDisplayProps}
            talentKey={tKey}
            subtitle={`Contellation Lv. ${i + 1}`}
            onClickTitle={editable ? (() => setState({ constellation: (i + 1) === constellation ? i : i + 1 })) : undefined}
          />
        </Col>
      })}
    </Row>
  </>
}
const ReactionComponents = {
  superconduct_dmg: SuperConductCard,
  electrocharged_dmg: ElectroChargedCard,
  overloaded_dmg: OverloadedCard,
  swirl_dmg: SwirlCard,
  shatter_dmg: ShatteredCard,
  crystalize_dmg: CrystalizeCard,
}
function ReactionDisplay({ character: { characterKey, reactionMode = "none" }, newBuild, equippedBuild, setState }) {
  let build = newBuild ? newBuild : equippedBuild
  let charEleKey = Character.getElementalKey(characterKey)
  let eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shatter_dmg") && Character.getWeaponTypeKey(characterKey) === "claymore") eleInterArr.push("shatter_dmg")
  return <Card bg="lightcontent" text="lightfont" className="mb-2">
    <Card.Body className="px-3 py-2">
      <Row>
        <Col ><Row className="mb-n2">
          {eleInterArr.map(key => {
            let Ele = ReactionComponents[key]
            if (!Ele) return null
            let val = build?.finalStats?.[key]
            val = val?.toFixed?.(Stat.fixedUnit(key)) || val
            return <Col xs="auto" className="mb-2" key={key}><Ele value={val} /></Col>
          })}
        </Row></Col>
        <Col xs="auto">
          {["pyro", "hydro", "cryo"].includes(charEleKey) && <ToggleButtonGroup
            type="radio" name="reactionMode" defaultValue={reactionMode} onChange={(val) => setState({ reactionMode: val === "none" ? null : val })}>
            <ToggleButton className="p-2" value={"none"}> <h6>No Elemental</h6> <h6>Interactions</h6></ToggleButton >
            {charEleKey === "pyro" && <ToggleButton className="p-2" value={"pyro_vaporize"}>
              <h5 className="text-vaporize">Vaporize(Pyro)</h5>
              <h4 className="text-vaporize mb-0">
                <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" />
              </h4>
            </ToggleButton >}
            {charEleKey === "pyro" && <ToggleButton className="p-2" value={"pyro_melt"}>
              <h5 className="text-melt">Melt(Pyro)</h5>
              <h4 className="text-melt mb-0">
                <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" />
              </h4>
            </ToggleButton >}
            {charEleKey === "hydro" && <ToggleButton className="p-2" value={"hydro_vaporize"}>
              <h5 className="text-vaporize">Melt(Pyro)</h5>
              <h4 className="text-vaporize mb-0">
                <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" />
              </h4>
            </ToggleButton >}
            {charEleKey === "cryo" && <ToggleButton className="p-2" value={"cryo_melt"}>
              <h5 className="text-melt">Melt(Pyro)</h5>
              <h4 className="text-melt mb-0">
                <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />
              </h4>
            </ToggleButton >}
          </ToggleButtonGroup>}
        </Col>
      </Row>

    </Card.Body>
  </Card>
}
function SuperConductCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("superconduct_dmg")}</h5>
    <h4 className="text-superconduct mb-0">
      <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /> {value}
    </h4>
  </Card.Body></Card>
}
function ElectroChargedCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("electrocharged_dmg")}</h5>
    <h4 className="text-electrocharged mb-0">
      <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /> {value}
    </h4>
  </Card.Body></Card>
}
function OverloadedCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("overloaded_dmg")}</h5>
    <h4 className="text-overloaded mb-0">
      <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /> {value}
    </h4>
  </Card.Body></Card>
}
function SwirlCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("swirl_dmg")}</h5>
    <h4 className="text-swirl mb-0">
      <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /> {value}
    </h4>
  </Card.Body></Card>
}
function ShatteredCard({ value }) {
  let information = <OverlayTrigger
    placement="top"
    overlay={<Tooltip>Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("shatter_dmg")}</h5>
    <h4 className="text-shatter mb-0">
      <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />+ <small className="text-physical">Heavy Attack{information} </small> {value}
    </h4>
  </Card.Body></Card>
}
function CrystalizeCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <h5>{Stat.getStatName("crystalize_dmg")}</h5>
    <h4 className="text-crystalize mb-0">
      <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /> {value}
    </h4>
  </Card.Body></Card>
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
function SkillDisplayCard(props) {
  let { character, character: { characterKey, constellation, autoInfused = false }, talentKey, subtitle, ascension, equippedBuild, newBuild, editable, setState } = props
  let { onClickTitle = null, ...otherProps } = props
  let build = newBuild ? newBuild : equippedBuild
  let header = null
  let { talentLvlKey = undefined, levelBoost = 0 } = Character.getTalentLevelKey(character, talentKey, constellation, true)
  let infuseBtn = null
  if (talentKey === "auto" && Character.isAutoInfusable(characterKey)) {
    let eleKey = Character.getElementalKey(characterKey)
    infuseBtn = <Col xs="auto">
      <Button variant={autoInfused ? eleKey : "secondary"} className="text-white" disabled={!editable} onClick={editable ? (() => setState(state => ({ autoInfused: !state.autoInfused }))) : undefined} size={editable ? null : "sm"}>
        {autoInfused ?
          <span>Infused with <b>{Character.getElementalName(eleKey)}</b></span>
          : "Not Infused"}
      </Button>
    </Col>
  }
  if (typeof talentLvlKey === "number") {
    if (editable) {
      let setTalentLevel = (tKey, tLvl) => setState(state => {
        let talentLevelKeys = state.talentLevelKeys || {}
        talentLevelKeys[tKey] = tLvl
        return { talentLevelKeys }
      })
      header = <Card.Header>
        <Row>
          <Col xs="auto">
            <DropdownButton title={`Talent Lv. ${talentLvlKey + 1}`}>
              {[...Array(talentLimits[ascension]).keys()].map(i =>
                <Dropdown.Item key={i} onClick={() => setTalentLevel(talentKey, i)}>Talent Lv. {i + levelBoost + 1}</Dropdown.Item>)}
            </DropdownButton>
          </Col>
          {infuseBtn}
        </Row>
      </Card.Header>
    } else {
      header = <Card.Header>
        <Row>
          <Col xs="auto">
            {`Talent Level: ${talentLvlKey + 1}`}
          </Col>
          <Col xs="auto">
            {infuseBtn}
          </Col>
        </Row>
      </Card.Header>
    }
  }
  let statsEle = null
  let talentStats = Character.getTalentStats(characterKey, talentKey, constellation, ascension)
  if (talentStats) {
    let statList = Object.entries(talentStats).map(([statKey, statVal], index) =>
      typeof statVal === "number" && <ListGroup.Item key={statKey} variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
        <div>
          <span><b>{Stat.getStatName(statKey)}</b></span>
          <span className="float-right text-right">{statVal}{Stat.getStatUnit(statKey)}</span>
        </div>
      </ListGroup.Item>
    ).filter(e => Boolean(e))//filter because modifiers cannot be displayed.
    statsEle = Boolean(statList.length) && <Row><Col>
      <Card bg="darkcontent" text="lightfont" className="mt-2 ml-n2 mr-n2">
        <ListGroup className="text-white" variant="flush">
          {statList}
        </ListGroup>
      </Card>
    </Col></Row>
  }

  return <Card bg="lightcontent" text="lightfont" className="h-100">
    {header}
    <Card.Body>
      <Row className="d-flex flex-row mb-245" onClick={onClickTitle} style={{ cursor: (editable && onClickTitle) ? "pointer" : "default" }}>
        <Col xs="auto" className="flex-shrink-1 d-flex flex-column">
          <Image src={Character.getTalentImg(characterKey, talentKey)} className="thumb-mid" />
        </Col>
        <Col className="flex-grow-1">
          <Card.Title>{Character.getTalentName(characterKey, talentKey)}</Card.Title>
          <Card.Subtitle>{subtitle}</Card.Subtitle>
        </Col>
      </Row>
      {Character.getTalentDocument(characterKey, talentKey).map((section, i) => {
        if (typeof section === "function")
          section = section(constellation, ascension)
        if (!section) return null

        let talentText = section.text
        if (typeof talentText === "function")
          talentText = talentText(talentLvlKey, build.finalStats, character)
        let fields = section.fields || []

        let conditional = section.conditional;
        if (typeof conditional === "function")
          conditional = conditional(talentLvlKey, constellation, ascension)
        let conditionalEle = null
        if (conditional) {
          let conditionalNum = ConditionalsUtil.getConditionalNum(character.talentConditionals, { srcKey: talentKey, srcKey2: conditional.conditionalKey })
          let conditionalStats = {}
          let conditionalFields = []
          if (conditionalNum) {
            conditionalStats = Character.getTalentConditionalStats(conditional, conditionalNum, {})
            //filter out modifiers from rendering
            conditionalStats = Object.fromEntries(Object.entries(conditionalStats).filter(([key, _]) => key !== "modifiers"))
            conditionalFields = Character.getTalentConditionalFields(conditional, conditionalNum, [])
          }
          let setConditional = (conditionalNum) => setState(state =>
            ({ talentConditionals: ConditionalsUtil.setConditional(state.talentConditionals, { srcKey: talentKey, srcKey2: conditional.conditionalKey }, conditionalNum) }))
          conditionalEle = <Col xs={12}>
            <Card bg="darkcontent" text="lightfont" className="mb-2">
              <Card.Header>
                <ConditionalSelector disabled={!editable}
                  conditional={conditional}
                  conditionalNum={conditionalNum}
                  setConditional={setConditional}
                  defEle={<span>{conditional.condition}</span>} />
              </Card.Header>
              <ListGroup className="text-white" variant="flush">
                {Object.entries(conditionalStats).map(([statKey, statVal], index) =>
                  <ListGroup.Item key={statKey} variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
                    <div>
                      <span><b>{Stat.getStatName(statKey)}</b></span>
                      <span className="float-right text-right">{statVal}{Stat.getStatUnit(statKey)}</span>
                    </div>
                  </ListGroup.Item>
                )}
                {conditionalFields.map((condField, i) => <FieldDisplay key={i + (conditionalStats?.length || 0)} index={i + (conditionalStats?.length || 0)} {...{ field: condField, talentLvlKey, ascension, ...otherProps }} />)}
              </ListGroup>
            </Card>
          </Col>
        }
        return <Row className="mt-2 mb-n2" key={"section" + i}><Col xs={12}>
          <div className="mb-2">{talentText}</div>
          {fields.length > 0 && <ListGroup className="text-white mb-2">
            {fields?.map?.((field, i) => <FieldDisplay key={i} index={i} {...{ field, talentLvlKey, ascension, ...otherProps }} />)}
          </ListGroup>}
        </Col>{conditionalEle}</Row>
      })}
      {statsEle}
    </Card.Body>
  </Card>
}
function FieldDisplay(props) {
  let { character, character: { compareAgainstEquipped, constellation }, field, index, talentLvlKey = 0, ascension, equippedBuild, newBuild } = props
  let build = newBuild ? newBuild : equippedBuild
  if (typeof field === "function")
    field = field(constellation, ascension)
  if (!field) return null

  let fieldText = field.text
  if (typeof fieldText === "function")
    fieldText = fieldText?.(talentLvlKey, build.finalStats, character)

  let fieldVariant = field.variant || ""
  if (typeof fieldVariant === "function")
    fieldVariant = fieldVariant?.(talentLvlKey, build.finalStats, character)

  let fieldBasic = field.basicVal
  if (typeof fieldBasic === "function")
    fieldBasic = fieldBasic?.(talentLvlKey, build.finalStats, character)
  if (fieldBasic)
    fieldBasic = <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{fieldBasic}</Tooltip>}
    >
      <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
    </OverlayTrigger>

  let fieldVal = field.value ? field.value : field.finalVal
  if (typeof fieldVal === "function")
    fieldVal = fieldVal?.(talentLvlKey, build.finalStats, character)
  let fixedVal = field.fixed || 0
  //compareAgainstEquipped
  if (compareAgainstEquipped && equippedBuild && typeof fieldVal === "number") {
    let fieldEquippedVal = field.value ? field.value : field.finalVal

    if (typeof fieldEquippedVal === "function")
      fieldEquippedVal = parseInt(fieldEquippedVal?.(talentLvlKey, equippedBuild.finalStats, character)?.toFixed?.(fixedVal))
    let diff = fieldVal - fieldEquippedVal
    fieldVal = <span>{fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff?.toFixed?.(fixedVal) || diff})</span> : ""}</span>
  }

  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
    <div>
      <span><b>{fieldText}</b>{fieldBasic}</span>
      <span className={`float-right text-right text-${fieldVariant}`} >{fieldVal?.toFixed?.(fixedVal) || fieldVal}</span>
    </div>
  </ListGroup.Item>
}
