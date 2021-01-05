import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from 'react'
import { Button, Card, Col, Dropdown, DropdownButton, Image, ListGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap"
import ConditionalSelector from "../../Components/ConditionalSelector"
import Stat from "../../Stat"
import ConditionalsUtil from "../../Util/ConditionalsUtil"
import Character from "../Character"

export default function CharacterTalentPane(props) {
  let { character: { levelKey, constellation }, editable, setState } = props
  //choose which one to display stats for
  let ascension = Character.getAscension(levelKey)

  let skillBurstList = [["auto", "Normal/Charged Attack"], ["skill", "Elemental Skill"], ["burst", "Elemental Burst"]]

  let passivesList = [["passive1", "Unlocked at Ascension 1", 1], ["passive2", "Unlocked at Ascension 4", 4], ["passive3", "Unlocked by Default", 0]]

  let skillDisplayProps = { ...props, ascension }
  return <>
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
    <Row>
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
              {[...Array(15).keys()].map(i =>
                i >= levelBoost && <Dropdown.Item key={i} onClick={() => setTalentLevel(talentKey, i - levelBoost)}>Talent Lv. {i + 1}</Dropdown.Item>)}
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
    statsEle = <Row><Col>
      <Card bg="darkcontent" text="lightfont" className="mt-2 ml-n2 mr-n2">
        <ListGroup className="text-white" variant="flush">
          {Object.entries(talentStats).map(([statKey, statVal], index) =>
            <ListGroup.Item key={statKey} variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
              <div>
                <span><b>{Stat.getStatName(statKey)}</b></span>
                <span className="float-right text-right">{statVal}{Stat.getStatUnit(statKey)}</span>
              </div>
            </ListGroup.Item>
          )}
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
            //filter out formulaOverrides from rendering
            conditionalStats = Object.fromEntries(Object.entries(conditionalStats).filter(([key, _]) => key !== "formulaOverrides"))
            conditionalFields = Character.getTalentConditionalFields(conditional, conditionalNum, [])
          }
          let setConditional = (conditionalNum) => setState(state =>
            ({ talentConditionals: ConditionalsUtil.setConditional(state.talentConditionals, { srcKey: talentKey, srcKey2: conditional.conditionalKey }, conditionalNum) }))
          conditionalEle = <Row><Col>
            <Card bg="darkcontent" text="lightfont" className="mt-2 ml-n2 mr-n2">
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
          </Col></Row>
        }
        return <Row className="mt-2" key={"section" + i}><Col xs={12}>
          <span>{talentText}</span>
          {fields.length > 0 && <ListGroup className="text-white ml-n2 mr-n2">
            {fields.map((field, i) => <FieldDisplay key={i} index={i} {...{ field, talentLvlKey, ascension, ...otherProps }} />)}
          </ListGroup>}
          {conditionalEle}
        </Col></Row>
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
  if (typeof fieldVal === "function") {
    fieldVal = fieldVal?.(talentLvlKey, build.finalStats, character)
  }
  if (typeof fieldVal === "number")
    fieldVal = Math.round(fieldVal)

  //compareAgainstEquipped
  if (compareAgainstEquipped && equippedBuild && typeof fieldVal === "number") {
    let fieldEquippedVal = field.value ? field.value : field.finalVal
    if (typeof fieldEquippedVal === "function")
      fieldEquippedVal = parseInt(fieldEquippedVal?.(talentLvlKey, equippedBuild.finalStats, character)?.toFixed?.(0))
    let diff = fieldVal - fieldEquippedVal
    fieldVal = <span>{fieldEquippedVal}{diff ? <span className={diff > 0 ? "text-success" : "text-danger"}> ({diff > 0 ? "+" : ""}{diff})</span> : ""}</span>
  }

  return <ListGroup.Item variant={index % 2 ? "customdark" : "customdarker"} className="p-2">
    <div>
      <span><b>{fieldText}</b>{fieldBasic}</span>
      <span className="float-right text-right">{fieldVal}</span>
    </div>
  </ListGroup.Item>
}