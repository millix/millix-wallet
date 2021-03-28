import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {MDBDataTable as DataTable} from 'mdbreact';


class PeerListView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            peer_list: {
                node_online_list : new Set(),
                node_offline_list: new Set(),
                columns          : [
                    {
                        label: '#',
                        field: 'node_idx',
                        width: 150
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="microchip" size="1x"/>,
                            ' node'
                        ],
                        field: 'node_url',
                        width: 270
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="power-off" size="1x"/>,
                            ' status'
                        ],
                        field: 'node_status',
                        width: 270
                    }
                ],
                rows             : []
            }
        };
    }

    componentWillReceiveProps(nextProps, nextContext) {
        let shouldUpdate    = false;
        let onlineNodeList  = new Set();
        let offlineNodeList = new Set();
        let peerList        = [];
        this.props.network.node_online_list.forEach((item, idx) => {
            if (!this.state.peer_list.node_online_list.has(item.nodeID)) {
                shouldUpdate = true;
            }
            onlineNodeList.add(item.nodeID);
            peerList.push({
                clickEvent : () => this.props.history.push('/peer/' + item.nodeID, {peer: item.nodeID}),
                node_idx   : idx,
                node_url   : item.node,
                node_status: 'up'
            });
        });
        this.props.network.node_offline_list.map((item, idx) => {
            if (!this.state.peer_list.node_offline_list.has(item.nodeID)) {
                shouldUpdate = true;
            }
            offlineNodeList.add(item.nodeID);
            peerList.push({
                clickEvent : () => this.props.history.push('/peer/' + item.nodeID, {peer: item.nodeID}),
                node_idx   : this.props.network.node_list.length + idx,
                node_url   : item.node,
                node_status: 'down'
            });
        });
        if (shouldUpdate) {
            this.setState({
                peer_list: {
                    columns          : [...this.state.peer_list.columns],
                    node_online_list : onlineNodeList,
                    node_offline_list: offlineNodeList,
                    rows             : peerList
                }
            });
        }
    }

    componentDidMount() {
    }

    render() {

        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading'}>connections</div>
                    <hr className={'hrPanel'}/>
                    <div className={'panel-body'}>
                        <Row>
                            <DataTable striped bordered small hover
                                       info={false}
                                       entries={10}
                                       entriesOptions={[
                                           10,
                                           30,
                                           50
                                       ]}
                                       data={this.state.peer_list}/>
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
