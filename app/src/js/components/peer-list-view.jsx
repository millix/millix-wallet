import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class PeerListView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>nodes list</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Row className="mb-3">
                            <div style={{
                                maxHeight: 310,
                                width    : '100%',
                                overflow : 'auto'
                            }}>
                                <Table striped bordered hover variant="dark">
                                    <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>node</th>
                                        <th>status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.props.network.node_online_list.map((item, idx) => {
                                        return (
                                            <tr key={item.node}
                                                className="wallet-address"
                                                onClick={() => {
                                                    this.props.history.push('/peer/' + item.nodeID, {peer: item.nodeID});
                                                }}>
                                                <td>{idx}</td>
                                                <td>{item.node}</td>
                                                <td style={{color: 'green'}}>ok</td>
                                            </tr>);
                                    })}
                                    {this.props.network.node_offline_list.map((item, idx) => {
                                        return (
                                            <tr key={item.node}
                                                className="wallet-node">
                                                <td>{this.props.network.node_list.length + idx}</td>
                                                <td>{item.node}</td>
                                                <td style={{color: 'red'}}>down</td>
                                            </tr>);
                                    })}
                                    </tbody>
                                </Table>
                            </div>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        network: state.network
    })
)(withRouter(PeerListView));
