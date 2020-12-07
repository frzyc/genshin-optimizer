import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { artifactStats, artifactSlots, star5ArtifactsSets, stars } from './ArtifactData'
import Artifact from './Artifact'
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import DropdownButton from 'react-bootstrap/DropdownButton'
import FormControl from 'react-bootstrap/FormControl'
import Alert from 'react-bootstrap/Alert';
import PercentBadge from './PercentBadge';
import { getRandomElementFromArray, getRandomIntInclusive, getRandomArbitrary } from '../Util';
import { FloatFormControl, IntFormControl } from '../Components/CustomFormControl';

export default class ArtifactEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = ArtifactEditor.initialState
  }
  static initialState = {
    selectedArtifactSetKey: "",
    numStars: 0,
    level: 0,
    slotKey: "",//one of flower, plume, sands, globlet, circlet
    mainStatKey: "",
    substats: [{}, {}, {}, {}],//{key:"",value:_}
  }
  static getInitialState = () => JSON.parse(JSON.stringify(ArtifactEditor.initialState))
  setLevel(newlevel) {
    newlevel = parseInt(newlevel)
    if (isNaN(newlevel)) newlevel = 0
    if (newlevel < 0) newlevel = 0;
    if (newlevel > this.state.numStars * 4) newlevel = this.state.numStars * 4;
    this.setState({ level: newlevel })
  }

  ArtifactDropDown = () =>
    <DropdownButton className="d-inline mr-3" title={Artifact.getArtifactSetName(this.state)}>
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊🟊</Dropdown.ItemText>
      {Object.entries(star5ArtifactsSets).map(([key, setobj]) =>
        <Dropdown.Item key={key}
          onClick={() => this.setState({ selectedArtifactSetKey: key, numStars: setobj.rarity[setobj.rarity.length - 1] })}
        >
          {setobj.name}
        </Dropdown.Item>
      )}
      <Dropdown.Divider />
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊🟊</Dropdown.ItemText>
      <Dropdown.ItemText>Max Rarity 🟊🟊🟊</Dropdown.ItemText>
    </DropdownButton>
  StarDropdown = () =>
    <DropdownButton className="d-inline mr-3" title={this.state.numStars > 0 ? "🟊".repeat(this.state.numStars) : "Rarity"} disabled={!this.state.selectedArtifactSetKey}>
      {Object.keys(stars).map((star, index) => {
        star = parseInt(star);
        return <Dropdown.Item key={index} disabled={!this.state.selectedArtifactSetKey || !star5ArtifactsSets[this.state.selectedArtifactSetKey].rarity.includes(star)} onClick={() => {
          this.setState({ numStars: star, level: 0 });
        }}>
          {"🟊".repeat(star)}
        </Dropdown.Item>
      })}
    </DropdownButton>
  LevelSelection = (props) =>
    <div className="d-inline" {...props} >
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Level</InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl
          value={this.state.level}
          disabled={!this.state.selectedArtifactSetKey}
          placeholder={`0~${this.state.numStars * 4}`}
          onChange={(e => this.setLevel(e.target.value))}
        />
        <InputGroup.Append>
          <Button onClick={() => this.setLevel(0)} disabled={!this.state.selectedArtifactSetKey || this.state.level === 0}>0</Button>
          <Button onClick={() => this.setLevel(this.state.level - 1)} disabled={!this.state.selectedArtifactSetKey || this.state.level === 0}>-</Button>
          <Button onClick={() => this.setLevel(this.state.level + 1)} disabled={!this.state.selectedArtifactSetKey || this.state.level === (this.state.numStars * 4)}>+</Button>
          <Button onClick={() => this.setLevel(this.state.numStars * 4)} disabled={!this.state.selectedArtifactSetKey || this.state.level === (this.state.numStars * 4)}>{this.state.numStars * 4}</Button>
        </InputGroup.Append>
      </InputGroup>
    </div>
  MainStatInputRow = () =>
    <InputGroup>
      <DropdownButton
        title={this.state.slotKey ? artifactSlots[this.state.slotKey].name : "Slot"}
        disabled={!this.state.selectedArtifactSetKey}
        as={InputGroup.Prepend}
      >
        {Object.entries(artifactSlots).map(([key, value]) =>
          <Dropdown.Item key={key} onClick={() =>
            this.setState({ slotKey: key, mainStatKey: value.stats[0], substats: ArtifactEditor.getInitialState().substats })
          } >
            {value.name}
          </Dropdown.Item>)}
      </DropdownButton>
      <FormControl
        value={Artifact.getArtifactPieceName(this.state)}
        disabled
        readOnly
      />
      <DropdownButton
        title={this.state.mainStatKey ? artifactStats[this.state.mainStatKey].name : "Main Stat"}
        disabled={!this.state.selectedArtifactSetKey || !this.state.slotKey}
        as={InputGroup.Prepend}
      >
        <Dropdown.ItemText>Select a Main Artifact Stat </Dropdown.ItemText>
        {this.state.slotKey ? artifactSlots[this.state.slotKey].stats.map((stat) =>
          <Dropdown.Item key={stat} onClick={() => {
            this.setState({ mainStatKey: stat, substats: ArtifactEditor.getInitialState().substats })
          }} >
            {Artifact.getStatName(stat)}
          </Dropdown.Item>) : <Dropdown.Item />}
      </DropdownButton>
      <FormControl
        value={this.state.mainStatKey ? `${Artifact.getMainStatValue(this.state)}${Artifact.getStatUnit(this.state.mainStatKey)}` : "Main Stat"}
        disabled
        readOnly
      />
    </InputGroup>
  SubStatInput = (props) => {
    let percentStat = props.subStatKey && Artifact.getStatUnit(props.subStatKey) === "%";
    let substatprops = {
      placeholder: "Select a Substat.",
      value: props.substatevalue ? props.substatevalue : "",
      onValueChange: (val) => props.onValueChange && props.onValueChange(val, props.index),
      disabled: !props.subStatKey
    }
    let subStatFormControl = percentStat ?
      <FloatFormControl {...substatprops} />
      : <IntFormControl {...substatprops} />
    return <InputGroup>
      <DropdownButton
        title={props.subStatKey ? artifactStats[props.subStatKey].name : `Substat ${props.index + 1}`}
        disabled={!props.remainingSubstats || props.remainingSubstats.length === 0}
        as={InputGroup.Prepend}
      >
        {props.remainingSubstats ? props.remainingSubstats.map((key) => {
          return (<Dropdown.Item key={key} onClick={() => {
            if (props.onSubStatSelected) props.onSubStatSelected(key, props.index);
          }} >
            {Artifact.getStatName(key)}
          </Dropdown.Item>)
        }) : <Dropdown.Item />}
      </DropdownButton>
      {subStatFormControl}
      <InputGroup.Append>
        {percentStat && <InputGroup.Text>%</InputGroup.Text>}
        <InputGroup.Text>
          <PercentBadge
            tooltip={props.subStatValidation.msg}
            valid={props.subStatValidation.valid || !props.subStatKey}
            percent={props.subStatValidation.efficiency}>
            {props.subStatKey ? (props.subStatValidation.valid ? `${(props.subStatValidation.efficiency ? props.subStatValidation.efficiency : 0).toFixed(2)}%` : "ERR") : "No Stat"}
          </PercentBadge>
        </InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
  }

  onSubStatSelected = (key, index) => {
    this.setState((state) => {
      let substats = JSON.parse(JSON.stringify(state.substats));
      substats[index] = { key: key, value: null }
      return { substats }
    });
  }
  onSubstatValueChange = (newStatValue, index) => {
    this.setState((state) => {
      let substats = JSON.parse(JSON.stringify(state.substats));
      substats[index].value = newStatValue
      return { substats }
    });
  }
  randomizeArtifact = () => {
    let state = ArtifactEditor.getInitialState();
    //randomly choose artifact set
    state.selectedArtifactSetKey = getRandomElementFromArray(Object.keys(star5ArtifactsSets));
    //choose star
    state.numStars = getRandomElementFromArray(star5ArtifactsSets[state.selectedArtifactSetKey].rarity);
    //choose piece
    state.slotKey = getRandomElementFromArray(Object.keys(artifactSlots));
    //choose mainstat
    state.mainStatKey = getRandomElementFromArray(artifactSlots[state.slotKey].stats);

    //choose initial substats from star
    let numOfInitialSubStats = getRandomIntInclusive(stars[state.numStars].subsBaselow, stars[state.numStars].subBaseHigh);

    //choose level
    state.level = getRandomIntInclusive(0, state.numStars * 4)
    let numUpgradesOrUnlocks = Math.floor(state.level / 4);
    let totRolls = numOfInitialSubStats + numUpgradesOrUnlocks
    if (totRolls >= 4) {
      numOfInitialSubStats = 4;
      numUpgradesOrUnlocks = totRolls - 4;
    } else {
      numOfInitialSubStats = totRolls;
      numUpgradesOrUnlocks = 0;
    }
    let RollStat = (subStatKey) => {
      let lowRoll = Artifact.getStatLowRollVal(subStatKey, state.numStars);
      let highRoll = Artifact.getStatHighRollVal(subStatKey, state.numStars);
      let unit = Artifact.getStatUnit(subStatKey)

      if (unit === "%")
        return parseFloat(getRandomArbitrary(lowRoll, highRoll).toFixed(1));
      else
        return getRandomIntInclusive(lowRoll, highRoll);
    }
    //set initial substat & value
    for (let i = 0; i < numOfInitialSubStats; i++) {
      let substat = state.substats[i]
      substat.key = getRandomElementFromArray(Artifact.getRemainingSubstats(state))
      substat.value = RollStat(substat.key)
    }

    //numUpgradesOrUnlocks should only have upgrades right now. that means all 4 substats have value.
    for (let i = 0; i < numUpgradesOrUnlocks; i++) {
      let substat = getRandomElementFromArray(state.substats)
      substat.value += RollStat(substat.key)
    }
    this.setState(state)
  }
  componentDidUpdate = () => {
    if (this.props.artifactToEdit && this.state.id !== this.props.artifactToEdit.id)
      this.setState(this.props.artifactToEdit)
  }
  render() {
    let remainingSubstats = Artifact.getRemainingSubstats(this.state);
    let substatValidations = this.state.substats.map(substat => Artifact.validateSubStat(this.state, substat));
    let artifactValidation = Artifact.artifactValidation(this.state, substatValidations)
    return (
      <Card bg="darkcontent" text="lightfont">
        <Card.Header>
          Artifact Editor
        </Card.Header>
        <Card.Body>
          <this.ArtifactDropDown />
          <this.StarDropdown />
          <this.LevelSelection className="mt-2 mb-2" />
          <this.MainStatInputRow />
          <Container className="mt-2">
            <Row>
              <h5 className="mr-auto">Substats</h5>
              <span>
                <span className="mr-3">
                  <span>Current Substat Efficiency </span>
                  <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.currentEfficiency}>
                    {(artifactValidation.currentEfficiency ? artifactValidation.currentEfficiency : 0).toFixed(2) + "%"}
                  </PercentBadge>
                </span>

                <span >
                  <span >Maximum Substat Efficiency </span>
                  <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.maximumEfficiency}>
                    {(artifactValidation.maximumEfficiency ? artifactValidation.maximumEfficiency : 0).toFixed(2) + "%"}
                  </PercentBadge>
                </span>
              </span>
            </Row>
            <Row>
              {this.state.substats.map((substat, index) =>
                <Col key={"substat" + index} className="col-sm-6 mt-1 mb-1">
                  <this.SubStatInput
                    numStars={this.state.numStars}
                    remainingSubstats={remainingSubstats}
                    subStatKey={substat ? substat.key : null}
                    substatevalue={substat ? substat.value : null}
                    index={index}
                    onValueChange={this.onSubstatValueChange}
                    onSubStatSelected={this.onSubStatSelected}
                    subStatValidation={substatValidations[index]}
                  />
                </Col>
              )}
            </Row>
          </Container>
          {artifactValidation.msg ? <Alert variant="danger">{artifactValidation.msg}</Alert> : null}
        </Card.Body>
        <Card.Footer>
          <Button className="mr-3" onClick={() => {
            let saveArtifact = { ...this.state }
            if (saveArtifact.artifactToEdit)
              delete saveArtifact.artifactToEdit;
            this.props.addArtifact && this.props.addArtifact(saveArtifact)
            this.setState(ArtifactEditor.getInitialState());
          }}>
            {this.props.artifactToEdit ? "Save Artifact" : "Add Artifact"}
          </Button>
          <Button className="mr-3" variant="success"
            onClick={() => {
              this.props.cancelEdit && this.props.cancelEdit();
              this.setState(ArtifactEditor.getInitialState());
            }}
          >
            Clear
          </Button>
          <Button variant="warning"
            onClick={this.randomizeArtifact}
          >
            Randomize
          </Button>
        </Card.Footer>
      </Card>)
  }
}
