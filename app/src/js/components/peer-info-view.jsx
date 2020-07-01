import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {getNodeAttribute} from '../redux/actions/index';


class PeerInfoView extends Component {
    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        let nodeID = this.props.location.state.peer;
        this.props.getNodeAttribute(nodeID);
    }

    render() {
        let attributes        = this.props.node.attributes;
        let simpleAttributes  = [];
        let tabularAttributes = [];
        attributes.forEach(ele => {
            if (ele.value instanceof Array) {
                tabularAttributes.push(ele);
            }
            else {
                simpleAttributes.push(
                    <Row className="mb-3"
                         style={{color: 'lightcyan'}}>
                        <h5>{ele.attribute_type}:</h5>&nbsp;<p>{ele.value}</p>
                    </Row>
                );
            }
        });

        return (
            <div>
                <Row className="mb-3 mt-3">
                    <Col className="pl-0" style={{
                        display       : 'flex',
                        justifyContent: 'flex-start'
                    }}>
                        <Button variant="outline-secondary"
                                onClick={this.props.history.goBack}>
                            <FontAwesomeIcon icon="arrow-circle-left"
                                             size="2x"/>
                            <span style={{
                                position   : 'relative',
                                top        : -5,
                                marginRight: 10,
                                marginLeft : 10
                            }}> Back</span>
                        </Button>
                    </Col>
                </Row>
                {simpleAttributes}
            </div>
        );
    }
}


export default connect(
    state => ({
        node: state.node
    }),
    {
        getNodeAttribute
    }
)(withRouter(PeerInfoView));