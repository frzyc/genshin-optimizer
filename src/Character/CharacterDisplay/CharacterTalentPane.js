import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from 'react';
import { Button, Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import Assets from "../../Assets/Assets";
import ConditionalSelector from "../../Components/ConditionalSelector";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import ConditionalsUtil from "../../Util/ConditionalsUtil";
import Character from "../Character";
import DamageOptionsAndCalculation from "./DamageOptionsAndCalculation";

export default function CharacterTalentPane(props) {
  let { character, character: { characterKey, levelKey, constellation }, editable, setState, setOverride, newBuild, equippedBuild } = props

  let ascension = Character.getAscension(levelKey)

  let skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]

  let passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]

  let skillDisplayProps = { ...props, ascension }

  return <>
    <Row><Col xs={12} className="mb-2">
      <DamageOptionsAndCalculation {...{ character, setState, setOverride, newBuild, equippedBuild }} />
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
  superconduct_hit: SuperConductCard,
  electrocharged_hit: ElectroChargedCard,
  overloaded_hit: OverloadedCard,
  swirl_hit: SwirlCard,
  shattered_hit: ShatteredCard,
  crystalize_hit: CrystalizeCard,
}
function ReactionDisplay({ character: { characterKey, reactionMode = "none" }, newBuild, equippedBuild, setState }) {
  let build = newBuild ? newBuild : equippedBuild
  let charEleKey = Character.getElementalKey(characterKey)
  let eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && Character.getWeaponTypeKey(characterKey) === "claymore") eleInterArr.push("shattered_hit")
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
      </Row>

    </Card.Body>
  </Card>
}
function SuperConductCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-superconduct">{Stat.getStatName("superconduct_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /> {value}</span>
  </Card.Body></Card>
}
function ElectroChargedCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-electrocharged">{Stat.getStatName("electrocharged_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /> {value}</span>
  </Card.Body></Card>
}
function OverloadedCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-overloaded">{Stat.getStatName("overloaded_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /> {value}</span>
  </Card.Body></Card>
}
function SwirlCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-swirl">{Stat.getStatName("swirl_hit")} <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /> {value}</span>
  </Card.Body></Card>
}
function ShatteredCard({ value }) {
  const information = <OverlayTrigger
    placement="top"
    overlay={<Tooltip>Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-shattered">{Stat.getStatName("shattered_hit")} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />+ <small className="text-physical">Heavy Attack{information} </small> {value}</span>
  </Card.Body></Card>
}
function CrystalizeCard({ value }) {
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-crystalize">{Stat.getStatName("crystalize_hit")} <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /> {value}</span>
  </Card.Body></Card>
}

function modifiersToFields(modifiers, finalStats = {}) {
  return Object.entries(modifiers).map(([mStatKey, modifier]) => ({
    text: Stat.getStatName(mStatKey),
    variant: Stat.getStatVariant(mStatKey),
    value: Object.entries(modifier ?? {}).reduce((accu, [mkey, multiplier]) => accu + finalStats[mkey] * multiplier, 0),
    basicVal: <span>{Object.entries(modifier ?? {}).map(([mkey, multiplier], i) => <span key={i} >{i !== 0 ? " + " : ""}{Stat.printStat(mkey, finalStats)} * {multiplier?.toFixed?.(3) ?? multiplier}</span>)}</span>,
    fixed: Stat.fixedUnit(mStatKey)
  }))
}
function statsToFields(stats, finalStats = {}) {
  return Object.entries(stats).map(([statKey, statVal]) =>
    statKey === "modifiers" ? modifiersToFields(statVal, finalStats) : { text: Stat.getStatName(statKey), variant: Stat.getStatVariant(statKey), value: statVal, fixed: Stat.fixedUnit(statKey) }
  ).flat()
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
function SkillDisplayCard(props) {
  let { character, character: { characterKey, constellation, autoInfused = false }, talentKey, subtitle, ascension, equippedBuild, newBuild, editable, setState } = props
  let { onClickTitle = null, ...otherProps } = props
  let build = newBuild ? newBuild : equippedBuild
  let header = null
  let { talentLvlKey = undefined, levelBoost = 0 } = Character.getTalentLevelKey(character, talentKey, true)
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
  let talentStats = Character.getTalentStats(characterKey, talentKey, constellation, ascension)
  const statsEle = talentStats && <Row><Col>
    <Card bg="darkcontent" text="lightfont" className="mt-2 ml-n2 mr-n2">
      <ListGroup className="text-white" variant="flush">
        {statsToFields(talentStats, build?.finalStats).map((field, i) =>
          <FieldDisplay key={i} index={i} {...{ field, talentLvlKey, ascension, ...otherProps }} />)}
      </ListGroup>
    </Card>
  </Col></Row>

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
          let conditionalFields = []
          if (conditionalNum) {
            let conditionalStats = Character.getTalentConditionalStats(conditional, conditionalNum, {})
            conditionalFields = [...Character.getTalentConditionalFields(conditional, conditionalNum, []), ...statsToFields(conditionalStats, build?.finalStats)]
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
                {conditionalFields.map((condField, i) => <FieldDisplay key={i} index={i} {...{ field: condField, talentLvlKey, ascension, ...otherProps }} />)}
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
function FieldDisplay({ character, character: { compareAgainstEquipped, constellation }, field, index, talentLvlKey = 0, ascension, equippedBuild, newBuild }) {
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
