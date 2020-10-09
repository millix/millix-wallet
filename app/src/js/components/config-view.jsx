import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Dropdown, DropdownButton, Form, Row, Table, Modal} from 'react-bootstrap';
import {addWalletAddressVersion, walletUpdateConfig, removeWalletAddressVersion} from '../redux/actions/index';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import bootstrap from '../../../../deps/millix-node/core/bootstrap';
import network from '../../../../deps/millix-node/net/network';
import Switch from 'react-switchery';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    },
    left    : {
        display       : 'flex',
        justifyContent: 'left'
    }
};


class ConfigView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false
        };
    }

    setConfig(data, isBootstrapConfig) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });
        if (isBootstrapConfig) {
            return bootstrap.updateBootstrapConfig(data);
        }
        else {
            return this.props.walletUpdateConfig(data);
        }
    }

    addAddressVersion() {
        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };
        this.props.addWalletAddressVersion(data);
        this.setState({
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false
        });
    }

    addToConfigList(configName, stateName) {
        let value        = this.state[stateName];
        const configList = this.props.config[configName];
        if (!value || configList.includes(value)) {
            return;
        }
        value = value.trim();
        configList.push(value);
        this.setState({[stateName]: ''});
        this.setConfig({[configName]: configList});
    }


    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
    }

    render() {
        return this.state.show_restart_modal ? (
            <div>
                <Modal.Dialog style={{color: 'black'}}>
                    <Modal.Header>
                        <Modal.Title>restart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5>the wallet will restart and connect to
                            the {this.state.is_main_network ? 'main' : 'test'} network</h5>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant={'danger'} onClick={() => {
                            this.setConfig({MODE_TEST_NETWORK: !this.state.is_main_network}, true)
                                .then(() => {
                                    nw.Window.get().reload();
                                });
                        }}>restart</Button>
                    </Modal.Footer>
                </Modal.Dialog>

            </div>) : (
                   <Row>
                       <Col md={12}>
                           <div className={'panel panel-filled'}>
                               <Col className={'panel-body'}>
                                   <Row>
                                       <Form>
                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>network
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Form.Group>
                                                       <Row>
                                                           <Col sm="1">
                                                               <Form.Label
                                                                   className="label-btn">
                                                                   debug
                                                               </Form.Label>
                                                           </Col>
                                                           <Col sm="1">
                                                               <div
                                                                   className="btn-group btn-full-width">
                                                                   <button
                                                                       data-toggle="dropdown"
                                                                       className="btn btn-w-sm  btn-accent dropdown-toggle btn-full-width"
                                                                       aria-expanded="false">{this.props.config.MODE_DEBUG ? 'on' : 'off'}
                                                                       <span
                                                                           className="caret"/>
                                                                   </button>
                                                                   <ul className="dropdown-menu">
                                                                       {Array.from([
                                                                           'on',
                                                                           'off'
                                                                       ]).map(type =>
                                                                           <li>
                                                                               <a
                                                                                   key={type}
                                                                                   href="#"
                                                                                   onClick={() => {
                                                                                       this.setConfig({MODE_DEBUG: type === 'on'});
                                                                                   }}>{type}</a>
                                                                           </li>
                                                                       )}
                                                                   </ul>
                                                               </div>
                                                           </Col>
                                                       </Row>
                                                   </Form.Group>
                                                   {/*
                                                    <Form.Group as={Row}>
                                                    <Form.Label column sm="1">
                                                    network
                                                    </Form.Label>

                                                    <Col sm="10" style={{
                                                    marginTop   : 'auto',
                                                    marginBottom: 'auto'
                                                    }}>
                                                    <Switch
                                                    className={"switch-class network-switch"}
                                                    id="networkSelectSwitch"
                                                    options={
                                                    {
                                                    color: '#9400CE',
                                                    size : 'small'
                                                    }
                                                    }
                                                    label={!this.props.config.MODE_TEST_NETWORK ? 'main network' : 'test network'}
                                                    checked={!this.props.config.MODE_TEST_NETWORK}
                                                    ref={(c) => this._network = c}
                                                    onChange={(checked) => {
                                                    this.setState({
                                                    is_main_network   : checked,
                                                    show_restart_modal: true
                                                    });
                                                    }}
                                                    />
                                                    </Col>
                                                    </Form.Group>*/}
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">network
                                                               port</label>

                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._port = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_PORT: this._port.value});
                                                               }}
                                                               value={this.props.config.NODE_PORT}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">rpc
                                                               port</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._api_port = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_PORT_API: this._api_port.value});
                                                               }}
                                                               value={this.props.config.NODE_PORT_API}/>

                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">server
                                                               bind</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._host = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_HOST: this._host.value});
                                                               }}
                                                               value={this.props.config.NODE_HOST}/>

                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">node
                                                               public ip</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               value={network.nodePublicIp}
                                                               readOnly/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">nodes</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._nodes = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_INITIAL_LIST: JSON.parse(this._nodes.value.split(','))});
                                                               }}
                                                               value={JSON.stringify(this.props.config.NODE_INITIAL_LIST)}/>

                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max
                                                               connections
                                                               in</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._max_in_connections = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_CONNECTION_INBOUND_MAX: this._max_in_connections.value});
                                                               }}
                                                               value={this.props.config.NODE_CONNECTION_INBOUND_MAX}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max
                                                               connections
                                                               out</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this.max_out_connections = c}
                                                               onChange={() => {
                                                                   this.setConfig({NODE_CONNECTION_OUTBOUND_MAX: this.max_out_connections.value});
                                                               }}
                                                               value={this.props.config.NODE_CONNECTION_OUTBOUND_MAX}/>

                                                       </Form.Group>
                                                   </Col>
                                               </div>
                                           </div>
                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>inbound
                                                   connection
                                                   whitelist
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">add
                                                               inbound
                                                               connection
                                                           </label>
                                                           <Row>
                                                               <Col sm="10"
                                                                    md="11">
                                                                   <Form.Control
                                                                       type="text"
                                                                       placeholder="node id"
                                                                       ref={(c) => this._connection_whitelist_inbound_node = c}
                                                                       onChange={() => {
                                                                           this.setState({connection_whitelist_inbound_node: this._connection_whitelist_inbound_node.value});
                                                                       }}
                                                                       value={this.state.connection_whitelist_inbound_node}/>
                                                               </Col>
                                                               <Col sm="2"
                                                                    md="1">
                                                                   <Button
                                                                       variant="light"
                                                                       className={'btn btn-accent btn-full-width'}
                                                                       size={'sm'}
                                                                       onClick={() => this.addToConfigList('NODE_CONNECTION_INBOUND_WHITELIST', 'connection_whitelist_inbound_node')}>
                                                                       <FontAwesomeIcon
                                                                           icon="plus"
                                                                           size="1x"/>
                                                                   </Button>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Table striped bordered
                                                              hover
                                                              variant="dark">
                                                           <thead>
                                                           <tr>
                                                               <th>node id</th>
                                                               <th></th>
                                                           </tr>
                                                           </thead>
                                                           <tbody>
                                                           {this.props.config.NODE_CONNECTION_INBOUND_WHITELIST.map((nodeID, idx) => {
                                                               return (
                                                                   <tr key={idx}
                                                                       className="table-row">
                                                                       <td>{nodeID}</td>
                                                                       <td style={{width: '5%'}}>
                                                                           <Button
                                                                               variant="light"
                                                                               className={'btn btn-accent'}
                                                                               size={'lg'}
                                                                               onClick={() => this.removeFromConfigList('NODE_CONNECTION_INBOUND_WHITELIST', nodeID)}>
                                                                               <FontAwesomeIcon
                                                                                   icon="trash"
                                                                                   size="1x"/>
                                                                           </Button>
                                                                       </td>
                                                                   </tr>);
                                                           })}
                                                           </tbody>
                                                       </Table>
                                                   </Col>
                                               </div>
                                           </div>

                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>outbound
                                                   connection
                                                   whitelist
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">add
                                                               outbound
                                                               connection
                                                           </label>
                                                           <Row>
                                                               <Col sm="10"
                                                                    md="11">
                                                                   <Form.Control
                                                                       type="text"
                                                                       placeholder="node id"
                                                                       ref={(c) => this._connection_whitelist_outbound_node = c}
                                                                       onChange={() => {
                                                                           this.setState({connection_whitelist_outbound_node: this._connection_whitelist_outbound_node.value});
                                                                       }}
                                                                       value={this.state.connection_whitelist_outbound_node}/>
                                                               </Col>
                                                               <Col sm="2"
                                                                    md="1">
                                                                   <Button
                                                                       variant="light"
                                                                       className={'btn btn-accent btn-full-width'}
                                                                       size={'sm'}
                                                                       onClick={() => this.addToConfigList('NODE_CONNECTION_OUTBOUND_WHITELIST', 'connection_whitelist_outbound_node')}>
                                                                       <FontAwesomeIcon
                                                                           icon="plus"
                                                                           size="1x"/>
                                                                   </Button>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Table striped bordered
                                                              hover
                                                              variant="dark">
                                                           <thead>
                                                           <tr>
                                                               <th>node id</th>
                                                               <th></th>
                                                           </tr>
                                                           </thead>
                                                           <tbody>
                                                           {this.props.config.NODE_CONNECTION_OUTBOUND_WHITELIST.map((nodeID, idx) => {
                                                               return (
                                                                   <tr key={idx}
                                                                       className="table-row">
                                                                       <td>{nodeID}</td>
                                                                       <td style={{width: '5%'}}>
                                                                           <Button
                                                                               variant="light"
                                                                               className={'btn btn-accent'}
                                                                               size={'lg'}
                                                                               onClick={() => this.removeFromConfigList('NODE_CONNECTION_OUTBOUND_WHITELIST', nodeID)}>
                                                                               <FontAwesomeIcon
                                                                                   icon="trash"
                                                                                   size="1x"/>
                                                                           </Button>
                                                                       </td>
                                                                   </tr>);
                                                           })}
                                                           </tbody>
                                                       </Table>
                                                   </Col>
                                               </div>
                                           </div>

                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>static
                                                   connection
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">add
                                                               static
                                                               connection
                                                           </label>
                                                           <Row>
                                                               <Col sm="10"
                                                                    md="11">
                                                                   <Form.Control
                                                                       type="text"
                                                                       placeholder="node id"
                                                                       ref={(c) => this._connection_static_node = c}
                                                                       onChange={() => {
                                                                           this.setState({connection_static_node: this._connection_static_node.value});
                                                                       }}
                                                                       value={this.state.connection_static_node}/>
                                                               </Col>
                                                               <Col sm="2"
                                                                    md="1">
                                                                   <Button
                                                                       variant="light"
                                                                       className={'btn btn-accent btn-full-width'}
                                                                       size={'sm'}
                                                                       onClick={() => this.addToConfigList('NODE_CONNECTION_STATIC', 'connection_static_node')}>
                                                                       <FontAwesomeIcon
                                                                           icon="plus"
                                                                           size="1x"/>
                                                                   </Button>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Table striped bordered
                                                              hover
                                                              variant="dark">
                                                           <thead>
                                                           <tr>
                                                               <th>node id</th>
                                                               <th></th>
                                                           </tr>
                                                           </thead>
                                                           <tbody>
                                                           {this.props.config.NODE_CONNECTION_STATIC.map((nodeID, idx) => {
                                                               return (
                                                                   <tr key={idx}
                                                                       className="table-row">
                                                                       <td>{nodeID}</td>
                                                                       <td style={{width: '5%'}}>
                                                                           <Button
                                                                               variant="light"
                                                                               className={'btn btn-accent'}
                                                                               size={'lg'}
                                                                               onClick={() => this.removeFromConfigList('NODE_CONNECTION_STATIC', nodeID)}>
                                                                               <FontAwesomeIcon
                                                                                   icon="trash"
                                                                                   size="1x"/>
                                                                           </Button>
                                                                       </td>
                                                                   </tr>);
                                                           })}
                                                           </tbody>
                                                       </Table>
                                                   </Col>
                                               </div>
                                           </div>


                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>consensus
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">number
                                                               of nodes</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_n_nodes = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_ROUND_NODE_COUNT: this._consensus_n_nodes.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_ROUND_NODE_COUNT}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">min
                                                               include
                                                               path</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_min_inc_path = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_ROUND_PATH_LENGTH_MIN: this._consensus_min_inc_path.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_ROUND_PATH_LENGTH_MIN}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">number
                                                               of validation
                                                               rounds</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_max_validation_rounds = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_ROUND_VALIDATION_MAX: this._consensus_max_validation_rounds.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_ROUND_VALIDATION_MAX}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max
                                                               double spend
                                                               bound</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_max_double_spend_rounds = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_ROUND_DOUBLE_SPEND_MAX: this._consensus_max_double_spend_rounds.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">number
                                                               of validation
                                                               required</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_required_validation_rounds = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_ROUND_VALIDATION_REQUIRED: this._consensus_required_validation_rounds.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max
                                                               wait
                                                               (sec)</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_max_wait_time = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_VALIDATION_WAIT_TIME_MAX: this._consensus_max_wait_time.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">retry
                                                               wait
                                                               (sec)</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._consensus_retry_wait_time = c}
                                                               onChange={() => {
                                                                   this.setConfig({CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this._consensus_retry_wait_time.value});
                                                               }}
                                                               value={this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME}/>
                                                       </Form.Group>
                                                   </Col>
                                               </div>
                                           </div>


                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>audit
                                                   point
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>

                                                   <Col>
                                                       <Form.Group>
                                                           <Row>
                                                               <Col sm="5" md="3">
                                                                   <label
                                                                       className="control-label label-btn">allow pruning my transactions</label>
                                                               </Col>
                                                               <Col sm="1">
                                                                   <div className="btn-group">
                                                                       <button
                                                                           data-toggle="dropdown"
                                                                           className="btn btn-w-sm btn-accent dropdown-toggle"
                                                                           aria-expanded="false">{this.props.config.WALLET_SPENT_TRANSACTION_PRUNE ? 'yes' : 'no'}
                                                                           <span
                                                                               className="caret"/>
                                                                       </button>
                                                                       <ul className="dropdown-menu">
                                                                           {Array.from([
                                                                               'yes',
                                                                               'no'
                                                                           ]).map(type =>
                                                                               <li><a key={type}
                                                                                      href="#"
                                                                                      onClick={() => {
                                                                                          this.setConfig({WALLET_SPENT_TRANSACTION_PRUNE: type === 'yes'});
                                                                                      }}>{type}</a>
                                                                               </li>
                                                                           )}
                                                                       </ul>
                                                                   </div>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">number of nodes</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_n_nodes = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_NODE_COUNT: this._audit_point_n_nodes.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_NODE_COUNT}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">number of validations</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_n_validations = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_VALIDATION_REQUIRED: this._audit_point_n_validations.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_VALIDATION_REQUIRED}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max attempts</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_max_attempts = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_ATTEMPT_MAX: this._audit_point_max_attempts.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_ATTEMPT_MAX}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max candidate transactions</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_max_candidate = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_CANDIDATE_MAX: this._audit_point_max_candidate.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_CANDIDATE_MAX}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">transaction pruning age (min)</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._transaction_prune_min_age = c}
                                                                         onChange={() => {
                                                                             this.setConfig({TRANSACTION_PRUNE_AGE_MIN: this._transaction_prune_min_age.value});
                                                                         }}
                                                                         value={this.props.config.TRANSACTION_PRUNE_AGE_MIN}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">
                                                               total transactions to prune
                                                               (512
                                                               max.)</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._transaction_prune_count = c}
                                                                         onChange={() => {
                                                                             this.setConfig({TRANSACTION_PRUNE_COUNT: Math.min(parseInt(this._transaction_prune_count.value), 512).toString()});
                                                                         }}
                                                                         value={this.props.config.TRANSACTION_PRUNE_COUNT}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">audit point pruning age (min)</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_prune_min_age = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_PRUNE_AGE_MIN: this._audit_point_prune_min_age.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_PRUNE_AGE_MIN}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">total audit points to prune
                                                               (512
                                                               max.)</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_prune_count = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_PRUNE_COUNT: Math.min(parseInt(this._audit_point_prune_count.value), 512).toString()});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_PRUNE_COUNT}/>
                                                       </Form.Group>
                                                   </Col>
                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">max wait (sec)</label>
                                                           <Form.Control type="text"
                                                                         placeholder=""
                                                                         ref={(c) => this._audit_point_max_wait_time = c}
                                                                         onChange={() => {
                                                                             this.setConfig({AUDIT_POINT_VALIDATION_WAIT_TIME_MAX: this._audit_point_max_wait_time.value});
                                                                         }}
                                                                         value={this.props.config.AUDIT_POINT_VALIDATION_WAIT_TIME_MAX}/>
                                                       </Form.Group>
                                                   </Col>
                                               </div>
                                           </div>

                                           <div
                                               className={'panel panel-filled'}>
                                               <div
                                                   className={'panel-heading'}>address
                                                   version
                                               </div>
                                               <hr className={'hrPanel'}/>
                                               <div className={'panel-body'}>
                                                   <Col>
                                                       <Form.Group>
                                                           <Row>
                                                               <Col sm="2">
                                                                   <label
                                                                       className="control-label label-btn">default address</label>
                                                               </Col>
                                                               <Col sm="1">
                                                                   <div
                                                                       className="btn-group">
                                                                       <button
                                                                           data-toggle="dropdown"
                                                                           className="btn btn-w-sm btn-accent dropdown-toggle"
                                                                           aria-expanded="false">{this.state.address_is_default ? 'yes' : 'no'}
                                                                           <span
                                                                               className="caret"/>
                                                                       </button>
                                                                       <ul className="dropdown-menu">
                                                                           {Array.from([
                                                                               'yes',
                                                                               'no'
                                                                           ]).map(type =>
                                                                               <li>
                                                                                   <a
                                                                                       key={type}
                                                                                       href="#"
                                                                                       onClick={() => {
                                                                                           this.setState({address_is_default: type === 'yes'});
                                                                                       }}>{type}</a>
                                                                               </li>
                                                                           )}
                                                                       </ul>
                                                                   </div>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">version</label>
                                                           <Form.Control
                                                               type="text"
                                                               placeholder=""
                                                               ref={(c) => this._address_version_name = c}
                                                               onChange={() => {
                                                                   this.setState({address_version_name: this._address_version_name.value});
                                                               }}
                                                               value={this.state.address_version_name}/>
                                                       </Form.Group>
                                                   </Col>

                                                   <Col>
                                                       <Form.Group>
                                                           <label
                                                               className="control-label">add
                                                               static
                                                               connection
                                                           </label>
                                                           <Row>
                                                               <Col sm="10"
                                                                    md="11">
                                                                   <Form.Control
                                                                       type="text"
                                                                       placeholder=""
                                                                       ref={(c) => this._address_version_regex = c}
                                                                       onChange={() => {
                                                                           this.setState({address_version_regex: this._address_version_regex.value});
                                                                       }}
                                                                       value={this.state.address_version_regex}/>
                                                               </Col>
                                                               <Col sm="2"
                                                                    md="1">
                                                                   <Button
                                                                       variant="light"
                                                                       className={'btn btn-accent btn-full-width'}
                                                                       size={'sm'}
                                                                       onClick={this.addAddressVersion.bind(this)}>
                                                                       <FontAwesomeIcon
                                                                           icon="plus"
                                                                           size="1x"/>
                                                                   </Button>
                                                               </Col>
                                                           </Row>
                                                       </Form.Group>
                                                   </Col>

                                                   <div>
                                                       <Table striped bordered
                                                              hover
                                                              variant="dark">
                                                           <thead>
                                                           <tr>
                                                               <th style={{width: 185}}>version</th>
                                                               <th>regex
                                                                   pattern
                                                               </th>
                                                               <th>default
                                                                   address
                                                               </th>
                                                               <th></th>
                                                           </tr>
                                                           </thead>
                                                           <tbody>
                                                           {this.props.wallet.address_version_list.map((addressVersion, idx) => {
                                                               return (
                                                                   <tr key={idx}
                                                                       className="table-row">
                                                                       <td>{addressVersion.version}</td>
                                                                       <td>{addressVersion.regex_pattern}</td>
                                                                       <td>{addressVersion.is_default === 1 ? 'yes' : 'no'}</td>
                                                                       <td style={{width: '5%'}}>
                                                                           <Button
                                                                               variant="light"
                                                                               className={'btn btn-accent'}
                                                                               size={'lg'}
                                                                               onClick={() => this.props.removeWalletAddressVersion(addressVersion)}>
                                                                               <FontAwesomeIcon
                                                                                   icon="trash"
                                                                                   size="1x"/>
                                                                           </Button>
                                                                       </td>
                                                                   </tr>);
                                                           })}
                                                           </tbody>
                                                       </Table>
                                                   </div>

                                               </div>
                                           </div>
                                       </Form>
                                   </Row>
                               </Col>
                           </div>
                       </Col>
                   </Row>);
    }
}


export default connect(
    state => ({
        config    : state.config,
        configType: state.configType,
        wallet    : state.wallet
    }),
    {
        walletUpdateConfig,
        addWalletAddressVersion,
        removeWalletAddressVersion
    })(withRouter(ConfigView));
