import React from 'react';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Artifact from './Artifact'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import { PercentBadge } from './Components';
import ArtifactEditor from './ArtifactEditor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt, faEdit } from '@fortawesome/free-solid-svg-icons'

export default class ArtifactDisplay extends React.Component {
  constructor(props) {
    super(props)
    ArtifactDatabase.populateDatebaseFromLocalStorage();
    this.state = {
      artIdList: [...artifactIdList],
      artToEdit: null,
    }
  }
  addArtifact = (art) => {
    if (this.state.artToEdit && this.state.artToEdit.id === art.id) {
      ArtifactDatabase.updateArtifact(art);
      this.setState({ artToEdit: null }, this.forceUpdate)
    } else {
      let id = ArtifactDatabase.addArtifact(art)
      //add the new artifact at the beginning
      this.setState((state) => ({ artIdList: [...state.artIdList, id] }))
    }
  }

  deleteArtifact = (index) => {
    ArtifactDatabase.removeArtifactById(this.state.artIdList[index])
    this.setState((state) => {
      let artIdList = [...state.artIdList]
      artIdList.splice(index, 1)
      return { artIdList }
    });
  }
  editArtifact = (index) =>
    this.setState({ artToEdit: ArtifactDatabase.getArtifact(this.state.artIdList[index]) })

  cancelEditArtifact = () =>
    this.setState({ artToEdit: null })

  render() {
    return (<Container className="mt-3">
      <Row className="mb-2"><Col>
        <ArtifactEditor
          artifactToEdit={this.state.artToEdit}
          addArtifact={this.addArtifact}
          cancelEdit={this.cancelEditArtifact}
        />
      </Col></Row>
      {/* <Row className="mb-2"><Col>
        <Card bg="darkcontent" text="lightfont">
          <Card.Header>Artifact Filter</Card.Header>
          <Card.Body>default filtering</Card.Body>
        </Card>
      </Col></Row> */}
      <Row>
        {this.state.artIdList.map((artid, index) =>
          <Col key={artid} lg={4} md={6} className="mb-2">
            <ArtifactCard
              artifactData={ArtifactDatabase.getArtifact(artid)}
              onDelete={() => this.deleteArtifact(index)}
              onEdit={() => this.editArtifact(index)}
            />
          </Col>
        )}
      </Row>
    </Container>)
  }
}
var artifactDatabase = {};
var artifactIdList = [];
var artIdIndex = 1;
class ArtifactDatabase {
  //do not instantiate.
  constructor() {
    if (this instanceof ArtifactDatabase) {
      throw Error('A static class cannot be instantiated.');
    }
  }
  static getIdList = () => this.loadFromLocalStorage("artifact_id_list")
  static saveIdList = () => this.saveToLocalStorage("artifact_id_list", artifactIdList)
  static populateDatebaseFromLocalStorage = () => {
    artifactIdList = this.getIdList();
    if (artifactIdList === null) artifactIdList = []
    for (const id of artifactIdList)
      artifactDatabase[id] = this.loadFromLocalStorage(id);
    artIdIndex = parseInt(localStorage.getItem("artifact_highest_id"));
    if (isNaN(artIdIndex)) artIdIndex = 0;
  }
  static addArtifact = (art) => {
    //generate id using artIdIndex
    let id = `artifact_${artIdIndex++}`
    localStorage.setItem("artifact_highest_id", artIdIndex)
    art.id = id;
    this.saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
    artifactIdList.push(id)
    this.saveIdList()
    return id;
  }
  static updateArtifact = (art) => {
    let id = art.id;
    this.saveToLocalStorage(id, art);
    artifactDatabase[id] = art;
  }
  static getArtifact = (id) => artifactDatabase[id]
  static removeArtifact = (art) => {
    this.removeArtifactById(art.id);
  }
  static removeArtifactById = (artId) => {
    delete artifactDatabase[artId];
    localStorage.removeItem(artId);
    let index = artifactIdList.indexOf(artId)
    if (index !== -1) {
      artifactIdList.splice(index, 1);
      this.saveIdList();
    }
  }
  static loadFromLocalStorage = (key) => {
    let data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data)
  }
  static saveToLocalStorage = (key, obj) =>
    localStorage.setItem(key, JSON.stringify(obj));

}
class ArtifactCard extends React.Component {
  render() {
    if (!this.props.artifactData) return null;
    let art = this.props.artifactData;
    let artifactValidation = Artifact.artifactValidation(art)
    return (<Card className="h-100" border={`${art.numStars}star`} bg="darkcontent" text="lightfont">
      <Card.Header className="pr-2">
        <Row className="no-gutters">
          <Col >
            <h6><b>{`${Artifact.getArtifactPieceName(art)}`}</b></h6>
            <div>{`${Artifact.getArtifactSlotName(art.slotKey)} +${art.level}`}</div>
          </Col>
          <Col xs={"auto"}>
            <span className="float-right align-top ml-1">
              <Button variant="primary" size="sm" className="mr-1"
                onClick={() => this.props.onEdit && this.props.onEdit()}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
              <Button variant="danger" size="sm"
                onClick={() => this.props.onDelete && this.props.onDelete()}>
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            </span>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Card.Title>
          <h6>{art.mainStatKey ? `${Artifact.getStatName(art.mainStatKey).split("%")[0]} ${Artifact.getMainStatValue(art)}${Artifact.getStatUnit(art.mainStatKey)}` : null}</h6>
        </Card.Title>
        <Card.Subtitle>
          <div>{Artifact.getArtifactSetName(art)}</div>
          <div>{"🟊".repeat(art.numStars ? art.numStars : 0)}</div>

        </Card.Subtitle>
        <ul className="mb-0">
          {art.substats ? art.substats.map((stat, i) =>
            (stat && stat.value) ? (<li key={i}>{`${Artifact.getStatName(stat.key).split("%")[0]}+${stat.value}${Artifact.getStatUnit(stat.key)}`}</li>) : null
          ) : null}
        </ul>
        <div>
          <span className="mb-0 mr-1">Substat Eff.:</span>
          <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.currentEfficiency}>
            {(artifactValidation.currentEfficiency ? artifactValidation.currentEfficiency : 0).toFixed(2) + "%"}
          </PercentBadge>
          <span>{"<"}</span>
          <PercentBadge tooltip={artifactValidation.msg} valid={artifactValidation.valid} percent={artifactValidation.maximumEfficiency}>
            {(artifactValidation.maximumEfficiency ? artifactValidation.maximumEfficiency : 0).toFixed(2) + "%"}
          </PercentBadge>
        </div>
      </Card.Body>
      <Card.Footer>
        Location: Inventory
        {/* <Button variant="primary"
          onClick={() => this.props.onEdit && this.props.onEdit()}
        >Edit</Button>
        <Button className="float-right" variant="danger"
          onClick={() => this.props.onDelete && this.props.onDelete()}>Delete</Button> */}
      </Card.Footer>
    </Card>)
  }
}