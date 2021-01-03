import { faEdit, faGavel, faQuoteLeft, faSave } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React, { useState } from "react"
import { Button, Card, Col, Dropdown, DropdownButton, Image, InputGroup, OverlayTrigger, Row, Tooltip } from "react-bootstrap"
import Assets from "../../Assets/Assets"
import ConditionalSelector from "../../Components/ConditionalSelector"
import { FloatFormControl, IntFormControl } from "../../Components/CustomFormControl"
import { Stars } from "../../Components/StarDisplay"
import StatIcon, { StatIconEle } from "../../Components/StatIcon"
import { CharacterSpecializedStatKey } from "../../Data/CharacterData"
import { LevelNameData } from "../../Data/WeaponData"
import Stat from "../../Stat"
import Weapon from "../../Weapon/Weapon"
import Character from "../Character"
import StatInput from "../StatInput"
export default function CharacterOverviewPane(props) {
  let { character: { characterKey, constellation }, editable, setOverridelevel, setConstellation } = props
  let [editLevel, setEditLevel] = useState(false)
  let elementKey = Character.getElementalKey(characterKey)
  let weaponTypeKey = Character.getWeaponTypeKey(characterKey)
  let level = Character.getLevelWithOverride(props.character)
  return <Row>
    <Col xs={12} lg={3} >
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
                  <IntFormControl onValueChange={setOverridelevel} value={level} />
                  <InputGroup.Append>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={<Tooltip>Changes the display level. Cosmetic only.</Tooltip>}
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
    <Col xs={12} lg={9} >
      <WeaponStatsEditorCard {...props} />
      <MainStatsCard {...props} />
    </Col>
  </Row >
}
function WeaponStatsEditorCard(props) {
  let [editing, SetEditing] = useState(false)
  let [showDescription, setShowDescription] = useState(false)
  let { character: { characterKey, weapon }, editable, setState, equippedBuild, newBuild } = props

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
  let weaponBonusStats = Weapon.getWeaponBonusStat(weapon.key, weapon.refineIndex)
  let conditionalStats = Weapon.getWeaponConditionalStat(weapon.key, weapon.refineIndex, weapon.conditionalNum)
  let conditional = Weapon.getWeaponConditional(weapon.key)
  let conditionalNum = weapon.conditionalNum;
  let conditionalEle = <ConditionalSelector
    conditional={conditional}
    conditionalNum={conditionalNum}
    setConditional={(cnum) => setStateWeapon("conditionalNum", cnum)}
    defEle={<h6 className="d-inline mb-0">{weaponPassiveName}</h6>}
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
          <Image src={Assets.weapons[weapon.key]} className="w-100 h-auto" thumbnail />
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
                  <span>Select Weapon Refinment</span>
                </Dropdown.ItemText>
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

            <p>{weaponPassiveName && Weapon.getWeaponPassiveDescription(weapon.key, weapon.refineIndex, build.finalStats)}</p>
            <Row>
              <Col xs={12} md={6}>
                <h5>ATK: {weaponDisplayMainVal}</h5>
              </Col>
              {subStatKey && <Col xs={12} md={6}>
                <h5>{Stat.getStatName(subStatKey)}: {weaponDisplaySubVal}{Stat.getStatUnit(subStatKey)}</h5>
              </Col>}
            </Row>
            {<Row>
              {(conditionalStats || weaponBonusStats) && <Col xs={12}><h6 className="mb-0">Bonus Stats:</h6></Col>}
              {weaponBonusStats && Object.entries(weaponBonusStats).map(([key, val]) =>
                <Col xs={12} md={6} key={"bonu" + key}>{Stat.getStatName(key)}: {val}{Stat.getStatUnit(key)}</Col>
              )}
              {conditionalStats && Object.entries(conditionalStats).map(([key, val]) =>
                <Col xs={12} md={6} key={"cond" + key}>{Stat.getStatName(key)}: {val}{Stat.getStatUnit(key)}</Col>
              )}
            </Row>}
          </Col>}
      </Row>
      {showDescription && <Row><Col><small>{Weapon.getWeaponDescription(weapon.key)}</small></Col></Row>}
    </Card.Body>
  </Card>
}

function MainStatsCard(props) {
  let [editing, SetEditing] = useState(false)
  let [editingOther, SetEditingOther] = useState(false)

  const statKeys = ["hp", "atk", "def", "ele_mas", "crit_rate", "crit_dmg", "ener_rech", "heal_bonu"]
  const otherStatKeys = ["stam", "inc_heal", "pow_shield", "red_cd", "phy_dmg", "phy_res"]

  Character.getElementalKeys().forEach(ele => {
    otherStatKeys.push(`${ele}_ele_dmg`)
    otherStatKeys.push(`${ele}_ele_res`)
  })
  const miscStatkeys = ["phy_avg_dmg", "norm_atk_dmg", "char_atk_dmg", "skill_dmg", "burst_dmg", "skill_crit_rate", "burst_crit_rate", "crit_multi", "dmg", "move_spd", "atk_spd", "weakspot_dmg"]

  let { editable, character, setOverride, equippedBuild, newBuild } = props
  let { character: { compareAgainstEquipped } } = props
  //choose which one to display stats for
  let build = newBuild ? newBuild : equippedBuild

  let specializedStatKey = Character.getStatValueWithOverride(character, "specializedStatKey")
  let specializedStatVal = Character.getStatValueWithOverride(character, "specializedStatVal");
  let specializedStatUnit = Stat.getStatUnit(specializedStatKey)

  let percentSpecialStatSlect = Stat.getStatUnit(specializedStatKey) === "%"
  let specialStatProps = {
    placeholder: "Character Special Stat",
    value: Character.getStatValueWithOverride(character, "specializedStatVal"),
    onValueChange: (value) => setOverride("specializedStatVal", value),
  }
  let specialStatInput = percentSpecialStatSlect ?
    <FloatFormControl {...specialStatProps} />
    : <IntFormControl {...specialStatProps} />

  const displayStats = (statKey) => {
    let statVal = Character.getStatValueWithOverride(character, statKey)
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (build?.finalStats?.[statKey] || 0) - statVal
    return <Col xs={12} lg={6} key={statKey}>
      <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> {buildDiff > 0 && "+"}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit}</span> : null}
      </span>
    </Col>
  }
  const displayNewBuildDiff = (statKey) => {
    let statVal = (equippedBuild?.finalStats?.[statKey] || Character.getStatValueWithOverride(character, statKey))
    let unit = Stat.getStatUnit(statKey)
    let buildDiff = (newBuild?.finalStats?.[statKey] || 0) - (equippedBuild?.finalStats?.[statKey] || 0)

    return <Col xs={12} lg={6} key={statKey}>
      <h6 className="d-inline">{StatIconEle(statKey)} {Stat.getStatName(statKey)}</h6>
      <span className={`float-right ${(editable && Character.hasOverride(character, statKey)) ? "text-warning" : ""}`}>
        {statVal?.toFixed(Stat.fixedUnit(statKey)) + unit}
        {buildDiff ? <span className={buildDiff > 0 ? "text-success" : "text-danger"}> ({buildDiff > 0 && "+"}{buildDiff?.toFixed(Stat.fixedUnit(statKey)) + unit})</span> : null}
      </span>
    </Col>
  }
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
            {statKeys.map(statKey =>
              <Col lg={6} xs={12} key={statKey}><StatOverrideInput {...props} {...{ statKey, icon: StatIcon[statKey] }} /></Col>)}

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
                {specialStatInput}
                {percentSpecialStatSlect && (<InputGroup.Append>
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup.Append>)}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {(newBuild && compareAgainstEquipped) ? statKeys.map(displayNewBuildDiff) : statKeys.map(displayStats)}
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
              <Col lg={6} xs={12} key={statKey}><StatOverrideInput {...props} {...{ statKey, icon: StatIcon[statKey] }} /></Col>)}
          </Row>
        </Card.Body> :
        <Card.Body>
          <Row className="mb-2">
            {(newBuild && compareAgainstEquipped) ? otherStatKeys.map(displayNewBuildDiff) : otherStatKeys.map(displayStats)}
          </Row>
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
        <Row className="mb-2">
          {(newBuild && compareAgainstEquipped) ? miscStatkeys.map(displayNewBuildDiff) : miscStatkeys.map(displayStats)}
        </Row>
      </Card.Body>
    </Card>
  </>
}


function StatOverrideInput(props) {
  let { character: { characterKey, levelKey }, statKey, icon, setOverride } = props
  return <StatInput
    className="mb-2"
    name={<span>{icon && <FontAwesomeIcon icon={icon} className="fa-fw" />} {Stat.getStatName(statKey)}</span>}
    placeholder={`Base ${Stat.getStatName(statKey)}`}
    value={Character.getStatValueWithOverrideRaw(props.character, statKey)}
    percent={false}
    onValueChange={(value) => setOverride(statKey, value)}
    defaultValue={Character.getBaseStatValue(characterKey, levelKey, statKey)}
  />
}
