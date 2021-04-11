import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from 'react';
import { Button, Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap";
import Assets from "../../Assets/Assets";
import ConditionalSelector from "../../Components/ConditionalSelector";
import Stat from "../../Stat";
import { ElementToReactionKeys } from "../../StatData";
import ConditionalsUtil from "../../Util/ConditionalsUtil";
import Character from "../Character";
import { compareAgainstEquippedContext } from "../CharacterDisplayCard";

export default function CharacterTalentPane(props) {
  const { character, character: { characterKey, levelKey, constellation }, editable, characterDispatch, newBuild, equippedBuild } = props
  const ascension = Character.getAscension(levelKey)
  const skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]
  const passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]
  const skillDisplayProps = { ...props, ascension }

  return <>
    <Row><Col><ReactionDisplay {...{ character, newBuild, equippedBuild }} /></Col></Row>
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
            onClickTitle={() => editable && characterDispatch({ constellation: (i + 1) === constellation ? i : i + 1 })}
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
  pyro_swirl_hit: SwirlCard,
  shattered_hit: ShatteredCard,
  crystalize_hit: CrystalizeCard,
}
function ReactionDisplay({ character: { characterKey }, newBuild, equippedBuild }) {
  const build = newBuild ? newBuild : equippedBuild
  const charEleKey = Character.getElementalKey(characterKey)
  const eleInterArr = [...(ElementToReactionKeys[charEleKey] || [])]
  if (!eleInterArr.includes("shattered_hit") && Character.getWeaponTypeKey(characterKey) === "claymore") eleInterArr.push("shattered_hit")
  return <Card bg="lightcontent" text="lightfont" className="mb-2">
    <Card.Body className="px-3 py-2">
      <Row className="mb-n2">
        {eleInterArr.map(key => {
          const Ele = ReactionComponents[key]
          if (!Ele) return null
          return <Col xs="auto" className="mb-2" key={key}><Ele stats={build?.finalStats} /></Col>
        })}
      </Row>
    </Card.Body>
  </Card>
}
function SuperConductCard({ stats }) {
  const sKey = "superconduct_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-superconduct">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function ElectroChargedCard({ stats }) {
  const sKey = "electrocharged_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-electrocharged">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.hydro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function OverloadedCard({ stats }) {
  const sKey = "overloaded_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-overloaded">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.pyro} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

const swirlEleToDisplay = {
  "pyro": <span>{Stat.getStatName("pyro_swirl_hit")} <Image src={Assets.elements.pyro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "electro": <span>{Stat.getStatName("electro_swirl_hit")} <Image src={Assets.elements.electro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "cryo": <span>{Stat.getStatName("cryo_swirl_hit")} <Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>,
  "hydro": <span>{Stat.getStatName("hydro_swirl_hit")} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.anemo} className="inline-icon" /></span>
}
function SwirlCard({ stats }) {
  const [ele, setele] = useState(Object.keys(swirlEleToDisplay)[0])
  const sKey = `${ele}_swirl_hit`
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-0">
    <DropdownButton size="sm" title={swirlEleToDisplay[ele]} className="d-inline-block" variant="success">
      {Object.entries(swirlEleToDisplay).map(([key, element]) => <Dropdown.Item key={key} onClick={() => setele(key)}>{element}</Dropdown.Item>)}
    </DropdownButton>
    <span className={`text-${ele} p-2`}> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function ShatteredCard({ stats }) {
  const sKey = "shattered_hit"
  const information = <OverlayTrigger
    placement="top"
    overlay={<Tooltip>Claymores, Plunging Attacks and <span className="text-geo">Geo DMG</span></Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger>
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-shattered">{Stat.getStatName(sKey)} <Image src={Assets.elements.hydro} className="inline-icon" />+<Image src={Assets.elements.cryo} className="inline-icon" />+ <small className="text-physical">Heavy Attack{information} </small> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}
function CrystalizeCard({ stats }) {
  const sKey = "crystalize_hit"
  return <Card bg="darkcontent" text="lightfont"><Card.Body className="p-2">
    <span className="text-crystalize">{Stat.getStatName(sKey)} <Image src={Assets.elements.electro} className="inline-icon" />/<Image src={Assets.elements.hydro} className="inline-icon" />/<Image src={Assets.elements.pyro} className="inline-icon" />/<Image src={Assets.elements.cryo} className="inline-icon" />+<Image src={Assets.elements.geo} className="inline-icon" /> {stats[sKey]?.toFixed(Stat.fixedUnit(sKey))}</span>
  </Card.Body></Card>
}

function modifiersToFields(modifiers, finalStats = {}) {
  return Object.entries(modifiers).map(([mStatKey, modifier]) => ({
    text: Stat.getStatName(mStatKey),
    variant: Stat.getStatVariant(mStatKey),
    value: Object.entries(modifier ?? {}).reduce((accu, [mkey, multiplier]) => accu + finalStats[mkey] * multiplier, 0),
    formulaText: <span>{Object.entries(modifier ?? {}).map(([mkey, multiplier], i) => <span key={i} >{i !== 0 ? " + " : ""}{Stat.printStat(mkey, finalStats)} * {multiplier?.toFixed?.(3) ?? multiplier}</span>)}</span>,
    fixed: Stat.fixedUnit(mStatKey),
    unit: Stat.getStatUnit(mStatKey)
  }))
}
function statsToFields(stats, finalStats = {}) {
  return Object.entries(stats).map(([statKey, statVal]) =>
    statKey === "modifiers" ? modifiersToFields(statVal, finalStats) : {
      text: Stat.getStatName(statKey),
      variant: Stat.getStatVariant(statKey),
      value: statVal,
      fixed: Stat.fixedUnit(statKey),
      unit: Stat.getStatUnit(statKey)
    }
  ).flat()
}

const talentLimits = [1, 1, 2, 4, 6, 8, 10]
function SkillDisplayCard({ character, character: { characterKey, constellation, talentLevelKeys = {}, autoInfused = false }, characterDispatch, talentKey, subtitle, ascension, equippedBuild, newBuild, editable, onClickTitle }) {
  let build = newBuild ? newBuild : equippedBuild
  let header = null
  let infuseBtn = null
  if (talentKey === "auto" && Character.isAutoInfusable(characterKey)) {
    let eleKey = Character.getElementalKey(characterKey)
    infuseBtn = <Col xs="auto">
      <Button variant={autoInfused ? eleKey : "secondary"} className="text-white" disabled={!editable} onClick={() => editable && characterDispatch({ autoInfused: !character.autoInfused })} size={editable ? null : "sm"}>
        {autoInfused ?
          <span>Infused with <b>{Character.getElementalName(eleKey)}</b></span>
          : "Not Infused"}
      </Button>
    </Col>
  }

  let talentLvlKey = 0
  if (talentKey in talentLevelKeys) {
    const talentLvlKeyRaw = talentLevelKeys[talentKey]
    const levelBoost = Character.getTalentLevelBoost(characterKey, talentKey, constellation)
    talentLvlKey = talentLvlKeyRaw + levelBoost
    if (editable) {
      const setTalentLevel = (tKey, newTalentLevelKey) => {
        talentLevelKeys[tKey] = newTalentLevelKey
        characterDispatch({ talentLevelKeys })
      }
      header = <Card.Header>
        <Row>
          <Col xs="auto">
            <DropdownButton title={`Talent Lv. ${talentLvlKey + 1}`}>
              {[...Array(talentLimits[ascension] + (talentKey === "auto" ? 1 : 0)).keys()].map(i =>
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
  const talentStats = Character.getTalentStats(characterKey, talentKey, build.finalStats)
  const statsEle = talentStats && <Row><Col>
    <Card bg="darkcontent" text="lightfont" className="mt-2 ml-n2 mr-n2">
      <ListGroup className="text-white" variant="flush">
        {statsToFields(talentStats, build?.finalStats).map((field, i) =>
          <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
      </ListGroup>
    </Card>
  </Col></Row>

  return <Card bg="lightcontent" text="lightfont" className="h-100">
    {header}
    <Card.Body>
      <Row className={`d-flex flex-row mb-2 ${(editable && onClickTitle) ? "cursor-pointer" : ""}`} onClick={onClickTitle} >
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
          section = section(build.finalStats)
        if (!section) return null

        let talentText = section.text
        if (typeof talentText === "function")
          talentText = talentText(build.finalStats)
        let fields = section.fields ?? []

        let conditional = section.conditional;
        if (typeof conditional === "function")
          conditional = conditional(build.finalStats)
        let conditionalEle = null
        if (conditional) {
          let conditionalNum = ConditionalsUtil.getConditionalNum(character.talentConditionals, { srcKey: talentKey, srcKey2: conditional.conditionalKey })
          let conditionalFields = []
          if (conditionalNum) {
            let conditionalStats = Character.getTalentConditionalStats(conditional, conditionalNum, {})
            conditionalFields = [...Character.getTalentConditionalFields(conditional, conditionalNum, []), ...statsToFields(conditionalStats, build?.finalStats)]
          }
          const setConditional = (conditionalNum) => characterDispatch({ talentConditionals: ConditionalsUtil.setConditional(character.talentConditionals, { srcKey: talentKey, srcKey2: conditional.conditionalKey }, conditionalNum) })
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
                {conditionalFields.map((condField, i) => <FieldDisplay key={i} index={i} {...{ field: condField, equippedBuild, newBuild }} />)}
              </ListGroup>
            </Card>
          </Col>
        }
        return <Row className="mt-2 mb-n2" key={"section" + i}><Col xs={12}>
          <div className="mb-2">{talentText}</div>
          {fields.length > 0 && <ListGroup className="text-white mb-2">
            {fields?.map?.((field, i) => <FieldDisplay key={i} index={i} {...{ field, equippedBuild, newBuild }} />)}
          </ListGroup>}
        </Col>{conditionalEle}</Row>
      })}
      {statsEle}
    </Card.Body>
  </Card>
}
function FieldDisplay({ field, index, equippedBuild, newBuild }) {
  const compareAgainstEquipped = useContext(compareAgainstEquippedContext)
  let build = newBuild ? newBuild : equippedBuild
  if (typeof field === "function")
    field = field(build.finalStats)
  if (!field) return null

  const fieldText = Character.getTalentFieldValue(field, "text", build.finalStats)
  const fieldVariant = Character.getTalentFieldValue(field, "variant", build.finalStats)

  const fieldFormulaText = Character.getTalentFieldValue(field, "formulaText", build.finalStats)
  const formulaTextOverlay = fieldFormulaText ? <OverlayTrigger
    placement="top"
    overlay={<Tooltip>{fieldFormulaText}</Tooltip>}
  >
    <FontAwesomeIcon icon={faQuestionCircle} className="ml-2" style={{ cursor: "help" }} />
  </OverlayTrigger> : null

  let fieldVal = null
  if (field.value)
    fieldVal = Character.getTalentFieldValue(field, "value", build.finalStats)
  else if (field.formula)
    fieldVal = Character.getTalentFieldValue(field, "formula", build.finalStats)?.[0]?.(build.finalStats)

  let fixedVal = field.fixed || 0
  const unit = Character.getTalentFieldValue(field, "unit", build.finalStats)
  //compareAgainstEquipped
  if (compareAgainstEquipped && equippedBuild && typeof fieldVal === "number") {
    let fieldEquippedVal = field.value ? field.value : field.formula?.(equippedBuild.finalStats)?.[0]?.(equippedBuild.finalStats)

    if (typeof fieldEquippedVal === "function")
      fieldEquippedVal = parseInt(fieldEquippedVal?.(equippedBuild.finalStats)?.toFixed?.(fixedVal))
    let diff = fieldVal - fieldEquippedVal
    fieldVal = <span>{fieldEquippedVal?.toFixed(fixedVal) ?? fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff?.toFixed?.(fixedVal) || diff})</span> : ""}</span>
  }

  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
    <div>
      <span><b>{fieldText}</b>{formulaTextOverlay}</span>
      <span className={`float-right text-right text-${fieldVariant}`} >{fieldVal?.toFixed?.(fixedVal) ?? fieldVal}{unit}</span>
    </div>
  </ListGroup.Item>
}
