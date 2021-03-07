import { faEdit, faGavel, faQuoteLeft, faSave, faUndo } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from "react"
import { Button, Card, Col, Dropdown, DropdownButton, Image, InputGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap"
import Assets from "../../Assets/Assets"
import ConditionalSelector from "../../Components/ConditionalSelector"
import CustomFormControl from "../../Components/CustomFormControl"
import { Stars } from "../../Components/StarDisplay"
import StatDisplay from "../../Components/StatDisplay"
import { StatIconEle } from "../../Components/StatIcon"
import { CharacterSpecializedStatKey } from "../../Data/CharacterData"
import { LevelNameData } from "../../Data/WeaponData"
import Stat from "../../Stat"
import { clamp } from "../../Util/Util"
import Weapon from "../../Weapon/Weapon"
import Character from "../Character"
import StatInput from "../StatInput"
export default function CharacterOverviewPane(props) {
  let { character, character: { characterKey, constellation }, editable, setOverride, setConstellation } = props
  let [editLevel, setEditLevel] = useState(false)
  let elementKey = Character.getElementalKey(characterKey)
  let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  let level = Character.getStatValueWithOverride(character, "characterLevel")
  return <Row>
    <Col xs={12} md={3} >
      {/* Image card with star and name and level */}
      <Card bg="lightcontent" text="lightfont" className="mb-2">
        <Card.Img src={Character.getCard(characterKey)} className="w-100 h-auto" />
        <Card.Body>
          <Row>
            <Col xs={12}>
              <h3>{Character.getName(characterKey)} <Image src={Assets.elements[elementKey]} className="inline-icon" /> <Image src={Assets.weaponTypes?.[weaponTypeKey]} className="inline-icon" /></h3>
              <h6><Stars stars={Character.getStar(characterKey)} colored /></h6>
            </Col>
            <Col>
              {editLevel ? <Row><Col>
                <InputGroup >
                  <InputGroup.Prepend>
                    <InputGroup.Text>Lvl.</InputGroup.Text>
                  </InputGroup.Prepend>
                  <CustomFormControl onValueChange={(val) => setOverride("characterLevel", clamp(val, 1, 90))} value={level} />
                  <InputGroup.Append>
                    <Button>
                      <FontAwesomeIcon icon={faUndo} size="sm" onClick={() => setOverride("characterLevel", Character.getLevel(character.levelKey))} />
                    </Button>
                  </InputGroup.Append>
                  <InputGroup.Append>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Override the level value for calculations. Does not change Stats.</Tooltip>}
                    >
                      <Button variant="danger" onClick={() => setEditLevel(!editLevel)} size="sm">
                        <span><FontAwesomeIcon icon={faSave} /></span>
                      </Button>
                    </OverlayTrigger>
                  </InputGroup.Append>
                </InputGroup>
              </Col></Row> :
                <Row>
                  <Col>
                    <h5>Level: {level}</h5>
                  </Col>
                  {editable ? <Col xs="auto" className="pr-1 pl-1">
                    <Button variant="info" onClick={() => setEditLevel(!editLevel)} size="sm">
                      <span><FontAwesomeIcon icon={faEdit} /></span>
                    </Button>
                  </Col> : null}
                </Row>}
            </Col>
            <Col xs={12}>
              <Row>
                <Col xs={12}><h5>{Character.getConstellationName(characterKey)}</h5></Col>
                <Col>
                  <Row className="px-2">
                    {[...Array(6).keys()].map(i =>
                      <Col xs={4} className="p-1" key={i}>
                        <Image src={Character.getConstellationImg(characterKey, i)} className={`w-100 h-auto ${constellation > i ? "" : "overlay-dark"}`}
                          style={{ cursor: "pointer" }} roundedCircle onClick={editable ? (() =>
                            setConstellation((i + 1) === constellation ? i : i + 1)) : null} />
                      </Col>)}
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
    <Col xs={12} md={9} >
      <WeaponStatsEditorCard {...props} />
      <MainStatsCards {...props} />
    </Col>
  </Row >
}
function StatItem({ statKey, val }) {
  if (!statKey) return null
  return <Col xs={12} lg={6} className="px-3">
    <span><b>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</b></span>
    <span className={`float-right text-right text-${Stat.getStatVariant(statKey)}`} >{val?.toFixed?.(Stat.fixedUnit(statKey)) || val}{Stat.getStatUnit(statKey)}</span>
  </Col>
}
function WeaponStatsCard({ title, stats = {}, finalStats = {} }) {
  if (Object.keys(stats ?? {}).length === 0) return null
  return <Card bg="darkcontent" text="lightfont" className="mb-2">
    <Card.Header className="py-2 px-3">{title}</Card.Header>
    <Card.Body className="py-2 px-0"><Row>
      {Object.entries(stats).map(([key, val]) => key === "modifiers" ? <React.Fragment key={key} >{Object.entries(val ?? {}).map(([mkey, modifier]) =>
        <StatItem key={mkey} statKey={mkey} val={Object.entries(modifier ?? {}).reduce((accu, [mkey, multiplier]) => accu + finalStats[mkey] * multiplier, 0)} />)}</React.Fragment>
        : <StatItem key={key} statKey={key} val={val} />)}
    </Row></Card.Body>
  </Card>
}
function WeaponStatsEditorCard(props) {
  let [editing, SetEditing] = useState(false)
  let [showDescription, setShowDescription] = useState(false)
  let { character, character: { characterKey, weapon = {} }, editable, setState, equippedBuild, newBuild } = props

  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild

  const setStateWeapon = (key, value) => setState(state => {
    //reset the conditionalNum when we switch weapons
    if (key === "key") state.weapon.conditionalNum = 0
    state.weapon[key] = value
    return { weapon: state.weapon }
  })
  let subStatKey = Weapon.getWeaponSubStatKey(weapon.key)
  let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  let weaponDisplayMainVal = weapon.overrideMainVal || Weapon.getWeaponMainStatVal(weapon.key, weapon.levelKey)
  let weaponDisplaySubVal = weapon.overrideSubVal || Weapon.getWeaponSubStatVal(weapon.key, weapon.levelKey)
  let weaponPassiveName = Weapon.getWeaponPassiveName(weapon.key)
  let weaponBonusStats = Weapon.getWeaponBonusStat(weapon.key, weapon.refineIndex, undefined)
  let conditionalStats = Weapon.getWeaponConditionalStat(weapon.key, weapon.refineIndex, weapon.conditionalNum, undefined)
  let conditional = Weapon.getWeaponConditional(weapon.key)
  let conditionalNum = weapon.conditionalNum;
  let conditionalEle = <ConditionalSelector
    conditional={conditional}
    conditionalNum={conditionalNum}
    setConditional={(cnum) => setStateWeapon("conditionalNum", cnum)}
    defEle={<span>{weaponPassiveName}</span>}
  />

  return <Card bg="lightcontent" text="lightfont" className="mb-2">
    <Card.Header>
      <Row>
        <Col>
          <span>Weapon</span>
        </Col>
        <Col xs="auto">
          <Button variant="info" size="sm" onClick={() => setShowDescription(!showDescription)}>
            <span><FontAwesomeIcon icon={faQuoteLeft} /> {showDescription ? "Hide Desc." : "Show Desc."}</span>
          </Button>
        </Col>
        {editable ? <Col xs="auto" >
          <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
            <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
          </Button>
        </Col> : null}
      </Row>
    </Card.Header>
    <Card.Body>
      <Row className="mb-2">
        <Col xs={12} md={3}>
          <Image src={Weapon.getWeaponImg(weapon.key)} className={`w-100 h-auto grad-${Weapon.getWeaponRarity(weapon.key)}star`} thumbnail />
        </Col>
        {editing ? <Col>
          <Row>
            <Col lg="auto" xs={6} className="mb-2 pr-0">
              <DropdownButton title={Weapon.getWeaponName(weapon.key)}>
                {[...Array(5).keys()].reverse().map(key => key + 1).map((star, i, arr) => <React.Fragment key={star}>
                  <Dropdown.ItemText key={"star" + star}><Stars stars={star} /></Dropdown.ItemText>
                  {Object.entries(Weapon.getWeaponsOfType(weaponTypeKey)).filter(([key, weaponObj]) => weaponObj.rarity === star).map(([key, weaponObj]) =>
                    <Dropdown.Item key={key} onClick={() => setStateWeapon("key", key)}>
                      {weaponObj.name}
                    </Dropdown.Item>
                  )}
                  {(i !== arr.length - 1) && < Dropdown.Divider />}
                </React.Fragment>)}
              </DropdownButton>
            </Col>
            <Col lg="auto" xs={6} className="mb-2 pr-0">
              <DropdownButton title={Weapon.getLevelName(weapon.levelKey)}>
                <Dropdown.ItemText>
                  <span>Select Weapon Level</span>
                </Dropdown.ItemText>
                {Object.entries(LevelNameData).map(([key, name]) =>
                  <Dropdown.Item key={key} onClick={() => setStateWeapon("levelKey", key)}>
                    {name}
                  </Dropdown.Item>)}
              </DropdownButton>
            </Col>
            {weaponPassiveName && <Col lg="auto" xs={6} className="mb-2">
              <DropdownButton title={`Refinement ${weapon.refineIndex + 1}`} className="w-100">
                <Dropdown.ItemText>
                  <span>Select Weapon Refinement</span>
                </Dropdown.ItemText>
                <Dropdown.Divider />
                {[...Array(5).keys()].map(key =>
                  <Dropdown.Item key={key} onClick={() => setStateWeapon("refineIndex", key)}>
                    {`Refinement ${key + 1}`}
                  </Dropdown.Item>)}
              </DropdownButton>
            </Col>}
            <Col xs={12} className="mb-2">
              <StatInput
                name={<span><FontAwesomeIcon icon={faGavel} className="mr-2" />ATK</span>}
                placeholder="Weapon Attack"
                value={weaponDisplayMainVal}
                percent={false}
                onValueChange={(value) => setStateWeapon("overrideMainVal", value)}
                defaultValue={Weapon.getWeaponMainStatVal(weapon.key, weapon.levelKey)}
              />
            </Col>
            {subStatKey && <Col xs={12} className="mb-2">
              <StatInput
                name={<span><span className="mr-2">{StatIconEle(subStatKey)}</span>{Stat.getStatName(subStatKey)}</span>}
                placeholder="Weapon Substat"
                value={weaponDisplaySubVal}
                percent={Stat.getStatUnit(subStatKey) === "%"}
                onValueChange={(value) => setStateWeapon("overrideSubVal", value)}
                defaultValue={Weapon.getWeaponSubStatVal(weapon.key, weapon.levelKey)}
              />
            </Col>}
          </Row>
        </Col> :
          <Col>
            <Row className="mb-2"><Col>
              <h5 className="mb-0">{Weapon.getWeaponName(weapon.key)} {Weapon.getLevelName(weapon.levelKey)} {weaponPassiveName && `(Refinement ${weapon.refineIndex + 1})`}</h5>
              <small ><Stars stars={Weapon.getWeaponRarity(weapon.key)} /></small>
            </Col></Row>
            <Row>
              <Col>{conditionalEle}</Col>
            </Row>

            <p>{weaponPassiveName && Weapon.getWeaponPassiveDescription(weapon.key, weapon.refineIndex, build?.finalStats, character)}</p>
            <WeaponStatsCard title={"Main Stats"} stats={{ atk: weaponDisplayMainVal, [subStatKey]: weaponDisplaySubVal }} finalStats={build?.finalStats} />
            <WeaponStatsCard title={"Bonus Stats"} stats={weaponBonusStats} finalStats={build?.finalStats} />
            <WeaponStatsCard title={"Conditional Stats"} stats={conditionalStats} finalStats={build?.finalStats} />
          </Col>}
      </Row>
      {showDescription && <Row><Col><small>{Weapon.getWeaponDescription(weapon.key)}</small></Col></Row>}
    </Card.Body>
  </Card>
}

function MainStatsCards(props) {
  let { editable, character, setOverride, equippedBuild, newBuild } = props

  let [editing, SetEditing] = useState(false)
  let [editingOther, SetEditingOther] = useState(false)

  let additionalKeys = ["eleMas", "critRate_", "critDMG_", "enerRech_", "heal_"]
  const displayStatKeys = ["finalHP", "finalATK", "finalDEF"]
  displayStatKeys.push(...additionalKeys)
  const editStatKeys = ["characterHP", "hp", "hp_", "characterATK", "atk", "atk_", "characterDEF", "def", "def_"]
  editStatKeys.push(...additionalKeys)
  const otherStatKeys = ["stamina", "incHeal_", "powShield_", "cdRed_"]

  Character.getElementalKeys().forEach(ele => {
    otherStatKeys.push(`${ele}_dmg_`)
    otherStatKeys.push(`${ele}_res_`)
  })
  const miscStatkeys = ["normal_dmg_", "charged_dmg_", "skill_dmg_", "burst_dmg_", "skill_critRate_", "burst_critRate_", "dmg_", "moveSPD_", "atkSPD_", "weakspotDMG_"]

  let specializedStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
  let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal");
  let specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  const isPercentSpecialStatSelect = Stat.getStatUnit(specializedStatKey) === "%"

  let displayNewBuildProps = { character, equippedBuild, newBuild, editable }
  return <>
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Main Base Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editing ? "danger" : "info"} onClick={() => SetEditing(!editing)} size="sm">
              <span><FontAwesomeIcon icon={editing ? faSave : faEdit} /> {editing ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editing ?
        <Card.Body>
          <Row className="mb-2">
            {editStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIconEle(statKey)} {Stat.getStatNamePretty(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatName(statKey)}`}
                  value={Character.getStatValueWithOverride(character, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={(value) => setOverride(statKey, value)}
                  defaultValue={Character.getBaseStatValue(character, statKey)}
                />
              </Col>)}

            <Col lg={6} xs={12}>
              <InputGroup>
                <DropdownButton
                  title={Stat.getStatNameWithPercent(specializedStatKey, "Specialized Stat")}
                  as={InputGroup.Prepend}
                >
                  <Dropdown.ItemText>Select Specialized Stat </Dropdown.ItemText>
                  {CharacterSpecializedStatKey.map(key =>
                    <Dropdown.Item key={key} onClick={() => setOverride("specializedStatKey", key)} >
                      {Stat.getStatNameWithPercent(key)}
                    </Dropdown.Item>)}
                </DropdownButton>
                <CustomFormControl float={isPercentSpecialStatSelect}
                  placeholder="Character Special Stat"
                  value={Character.getStatValueWithOverride(character, "specializedStatVal")}
                  onValueChange={(value) => setOverride("specializedStatVal", value)} />
                {isPercentSpecialStatSelect && (<InputGroup.Append>
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup.Append>)}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {displayStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay statKey={statKey} {...displayNewBuildProps} /></Col>)}
            {specializedStatVal ? <Col lg={6} xs={12}>
              <span><b>Specialized:</b> <span className={Character.hasOverride(character, "specializedStatKey") ? "text-warning" : ""}>{Stat.getStatName(specializedStatKey)}</span></span>
              <span className={`float-right ${Character.hasOverride(character, "specializedStatVal") ? "text-warning" : ""}`}>{`${specializedStatVal}${specializedStatUnit}`}</span>
            </Col> : null}
          </Row>
        </Card.Body>
      }
    </Card >
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Other Stats</span>
          </Col>
          {editable ? <Col xs="auto" >
            <Button variant={editingOther ? "danger" : "info"} onClick={() => SetEditingOther(!editingOther)} size="sm">
              <span><FontAwesomeIcon icon={editingOther ? faSave : faEdit} /> {editingOther ? "EXIT" : "EDIT"}</span>
            </Button>
          </Col> : null}
        </Row>
      </Card.Header>
      {editingOther ?
        <Card.Body>
          <Row className="mb-2">
            {otherStatKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}>
                <StatInput
                  className="mb-2"
                  name={<span>{StatIconEle(statKey)} {Stat.getStatName(statKey)}</span>}
                  placeholder={`Base ${Stat.getStatNameRaw(statKey)}`}
                  value={Character.getStatValueWithOverride(character, statKey)}
                  percent={Stat.getStatUnit(statKey) === "%"}
                  onValueChange={(value) => setOverride(statKey, value)}
                  defaultValue={Character.getBaseStatValue(character, statKey)}
                />
              </Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">{otherStatKeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
        </Card.Body>
      }
    </Card>
    <Card bg="lightcontent" text="lightfont" className="mb-2">
      <Card.Header>
        <Row>
          <Col>
            <span>Misc Stats</span>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Row className="mb-2">{miscStatkeys.map(statKey => <Col xs={12} lg={6} key={statKey} ><StatDisplay statKey={statKey} {...displayNewBuildProps} /></Col>)}</Row>
      </Card.Body>
    </Card>
  </>
}
