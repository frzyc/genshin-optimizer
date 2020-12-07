import React from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import ArtifactCard from './ArtifactCard';
import ArtifactDatabase from './ArtifactDatabase';
import ArtifactEditor from './ArtifactEditor';

export default class ArtifactDisplay extends React.Component {
  constructor(props) {
    super(props)
    ArtifactDatabase.populateDatebaseFromLocalStorage();
    this.state = {
      artIdList: [...ArtifactDatabase.getartifactIdList()],
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
      <Row className="mb-2 no-gutters"><Col>
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
      <Row className="mb-2">
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

