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
            if (!ele)
                return;
            if (ele.value instanceof Array) {
                if(ele.attribute_type === 'shard_protocol')
                    ele.value.forEach(entry => {
                            tabularAttributes.push(entry);
                    });
            }
            else if (ele.value instanceof Object) {
                for (let [key, value] of Object.entries(ele.value)) {
                    let attributeType = key.replace(/_/g, ' ');
                    simpleAttributes.push(
                        <Row className="mb-3">
                            <span>{attributeType}: {value}</span>
                        </Row>
                    );
                }
            }
            else {
                if(ele.value instanceof Object){
                    Object.entries(ele.value).forEach(([key, value]) => {
                        let attributeType = key.replace(/_/g, ' ');
                        simpleAttributes.push(
                            <Row className="mb-3">
                                <span>{attributeType}: {value}</span>
                            </Row>
                        );
                    });
                }
                else {
                    let attributeType = ele.attribute_type.replace(/_/g, ' ');
                    simpleAttributes.push(
                        <Row className="mb-3">
                            <span>{attributeType}: {ele.value}</span>
                        </Row>
                    );
                }
            }
        });

        return (
            <div>
                <Row className="mb-3 mt-3">
                    <Col className="pl-0" style={{
                        display       : 'flex',
                        justifyContent: 'flex-start',
                        marginLeft: 10
                    }}>
                        <Button variant="light"
                                className={'btn btn-w-md btn-accent'}
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
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>peer attributes</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>

                        {simpleAttributes}
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>shard attributes</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Table striped bordered hover variant="dark">
                            <thead>
                            <tr>
                                <th>shard id</th>
                                <th>transaction count</th>
                                <th>update date</th>
                                <th>is required</th>
                                <th>fee ask request byte</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tabularAttributes.map((item, idx) => {
                                return (
                                    <tr key={idx} className="wallet-node">
                                        <td>{item.shard_id}</td>
                                        <td>{item.transaction_count}</td>
                                        <td>{item.update_date}</td>
                                        <td>{item.is_required ? 'yes' : 'no'}</td>
                                        <td>{item.fee_ask_request_byte}</td>
                                    </tr>);
                            })}
                            </tbody>
                        </Table>

                    </div>
                </div>
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
