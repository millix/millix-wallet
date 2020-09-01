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
                        <div className={'panel-body'}>
                           <Row>
                               <Form>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="1">
                                           debug
                                       </Form.Label>

                                       <Col sm="10">
                                           <div className="btn-group">
                                               <button data-toggle="dropdown"
                                                       className="btn btn-accent dropdown-toggle"
                                                       aria-expanded="false">{this.props.config.MODE_DEBUG ? 'on' : 'off'} <span className="caret"/>
                                               </button>
                                               <ul className="dropdown-menu">
                                                   {Array.from([
                                                       'on',
                                                       'off'
                                                   ]).map(type =>
                                                       <li><a key={type}
                                                              href="#"
                                                              onClick={() => {
                                                                  this.setConfig({MODE_DEBUG: type === 'on'});
                                                              }}>{type}</a></li>
                                                   )}
                                               </ul>
                                           </div>
                                       </Col>
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
                                                       color: '#f6a821',
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
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="3">
                                           network port
                                       </Form.Label>
                                       <Col sm="2">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._port = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_PORT: this._port.value});
                                                         }}
                                                         value={this.props.config.NODE_PORT}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           rpc port
                                       </Form.Label>
                                       <Col sm="2">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._api_port = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_PORT_API: this._api_port.value});
                                                         }}
                                                         value={this.props.config.NODE_PORT_API}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           server bind
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._host = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_HOST: this._host.value});
                                                         }}
                                                         value={this.props.config.NODE_HOST}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           node public ip
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         value={network.nodePublicIp}
                                                         readOnly/>
                                       </Col>

                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           nodes
                                       </Form.Label>
                                       <Col sm="8">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._nodes = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_INITIAL_LIST: JSON.parse(this._nodes.value.split(','))});
                                                         }}
                                                         value={JSON.stringify(this.props.config.NODE_INITIAL_LIST)}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           max connections in
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._max_in_connections = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_CONNECTION_INBOUND_MAX: this._max_in_connections.value});
                                                         }}
                                                         value={this.props.config.NODE_CONNECTION_INBOUND_MAX}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           max connections out
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this.max_out_connections = c}
                                                         onChange={() => {
                                                             this.setConfig({NODE_CONNECTION_OUTBOUND_MAX: this.max_out_connections.value});
                                                         }}
                                                         value={this.props.config.NODE_CONNECTION_OUTBOUND_MAX}/>
                                       </Col>
                                   </Form.Group>


                                   <Form.Group as={Row}>
                                       <Form.Label column sm="12">
                                           inbound connection whitelist
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Col sm="8">
                                           <Form.Control type="text"
                                                         placeholder="node id"
                                                         ref={(c) => this._connection_whitelist_inbound_node = c}
                                                         onChange={() => {
                                                             this.setState({connection_whitelist_inbound_node: this._connection_whitelist_inbound_node.value});
                                                         }}
                                                         value={this.state.connection_whitelist_inbound_node}/>
                                       </Col>
                                       <Col sm="2">
                                           <Button variant="light" className={"btn btn-w-sm btn-accent"}
                                                   size={'sm'}
                                                   onClick={() => this.addToConfigList('NODE_CONNECTION_INBOUND_WHITELIST', 'connection_whitelist_inbound_node')}>
                                               <FontAwesomeIcon icon="plus"
                                                                size="1x"/>
                                           </Button>
                                       </Col>
                                   </Form.Group>
                                   <div style={{
                                       width   : '100%',
                                       overflow: 'auto'
                                   }}>
                                       <Table striped bordered hover
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
                                                       <td>
                                                           <Button
                                                               variant="light" className={"btn btn-w-sm btn-accent"}
                                                               size={'sm'}
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
                                   </div>

                                   <Form.Group as={Row}>
                                       <Form.Label column sm="12">
                                           outbound connection whitelist
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Col sm="8">
                                           <Form.Control type="text"
                                                         placeholder="node id"
                                                         ref={(c) => this._connection_whitelist_outbound_node = c}
                                                         onChange={() => {
                                                             this.setState({connection_whitelist_outbound_node: this._connection_whitelist_outbound_node.value});
                                                         }}
                                                         value={this.state.connection_whitelist_outbound_node}/>
                                       </Col>
                                       <Col sm="2">
                                           <Button variant="light" className={"btn btn-w-sm btn-accent"}
                                                   size={'sm'}
                                                   onClick={() => this.addToConfigList('NODE_CONNECTION_OUTBOUND_WHITELIST', 'connection_whitelist_outbound_node')}>
                                               <FontAwesomeIcon icon="plus"
                                                                size="1x"/>
                                           </Button>
                                       </Col>
                                   </Form.Group>

                                   <div style={{
                                       width   : '100%',
                                       overflow: 'auto'
                                   }}>
                                       <Table striped bordered hover
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
                                                       <td>
                                                           <Button
                                                               variant="light" className={"btn btn-w-sm btn-accent"}
                                                               size={'sm'}
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
                                   </div>

                                   <Form.Group as={Row}>
                                       <Form.Label column sm="12">
                                           static connection
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Col sm="8">
                                           <Form.Control type="text"
                                                         placeholder="node id"
                                                         ref={(c) => this._connection_static_node = c}
                                                         onChange={() => {
                                                             this.setState({connection_static_node: this._connection_static_node.value});
                                                         }}
                                                         value={this.state.connection_static_node}/>
                                       </Col>
                                       <Col sm="2">
                                           <Button variant="light" className={"btn btn-w-sm btn-accent"}
                                                   size={'sm'}
                                                   onClick={() => this.addToConfigList('NODE_CONNECTION_STATIC', 'connection_static_node')}>
                                               <FontAwesomeIcon icon="plus"
                                                                size="1x"/>
                                           </Button>
                                       </Col>
                                   </Form.Group>

                                   <div style={{
                                       width   : '100%',
                                       overflow: 'auto'
                                   }}>
                                       <Table striped bordered hover
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
                                                       <td>
                                                           <Button
                                                               variant="light" className={"btn btn-w-sm btn-accent"}
                                                               size={'sm'}
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
                                   </div>

                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           consensus
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           number of nodes
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_n_nodes = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_ROUND_NODE_COUNT: this._consensus_n_nodes.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_ROUND_NODE_COUNT}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           min include path
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_min_inc_path = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_ROUND_PATH_LENGTH_MIN: this._consensus_min_inc_path.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_ROUND_PATH_LENGTH_MIN}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           number of validation rounds
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_max_validation_rounds = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_ROUND_VALIDATION_MAX: this._consensus_max_validation_rounds.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_ROUND_VALIDATION_MAX}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           max double spend round
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_max_double_spend_rounds = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_ROUND_DOUBLE_SPEND_MAX: this._consensus_max_double_spend_rounds.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           number of validation required
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_required_validation_rounds = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_ROUND_VALIDATION_REQUIRED: this._consensus_required_validation_rounds.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           max wait (sec)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_max_wait_time = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_VALIDATION_WAIT_TIME_MAX: this._consensus_max_wait_time.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           retry wait (sec)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._consensus_retry_wait_time = c}
                                                         onChange={() => {
                                                             this.setConfig({CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this._consensus_retry_wait_time.value});
                                                         }}
                                                         value={this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="10">
                                           audit point
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           number of nodes
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_n_nodes = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_NODE_COUNT: this._audit_point_n_nodes.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_NODE_COUNT}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           number of validations
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_n_validations = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_VALIDATION_REQUIRED: this._audit_point_n_validations.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_VALIDATION_REQUIRED}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           max attempts
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_max_attempts = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_ATTEMPT_MAX: this._audit_point_max_attempts.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_ATTEMPT_MAX}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           max candidate transactions
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_max_candidate = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_CANDIDATE_MAX: this._audit_point_max_candidate.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_CANDIDATE_MAX}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           transaction pruning age (min)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._transaction_prune_min_age = c}
                                                         onChange={() => {
                                                             this.setConfig({TRANSACTION_PRUNE_AGE_MIN: this._transaction_prune_min_age.value});
                                                         }}
                                                         value={this.props.config.TRANSACTION_PRUNE_AGE_MIN}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           total transactions to prune (512 max.)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._transaction_prune_count = c}
                                                         onChange={() => {
                                                             this.setConfig({TRANSACTION_PRUNE_COUNT: Math.min(parseInt(this._transaction_prune_count.value), 512).toString()});
                                                         }}
                                                         value={this.props.config.TRANSACTION_PRUNE_COUNT}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           audit point pruning age (min)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_prune_min_age = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_PRUNE_AGE_MIN: this._audit_point_prune_min_age.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_PRUNE_AGE_MIN}/>
                                       </Col>

                                       <Form.Label column sm="2">
                                           total audit points to prune (512 max.)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_prune_count = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_PRUNE_COUNT: Math.min(parseInt(this._audit_point_prune_count.value), 512).toString()});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_PRUNE_COUNT}/>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           allow pruning my transactions
                                       </Form.Label>
                                       <Col sm="3">
                                           <div className="btn-group">
                                               <button data-toggle="dropdown"
                                                       className="btn btn-accent dropdown-toggle"
                                                       aria-expanded="false">{this.props.config.WALLET_SPENT_TRANSACTION_PRUNE ? 'yes' : 'no'} <span className="caret"/>
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
                                                              }}>{type}</a></li>
                                                   )}
                                               </ul>
                                           </div>
                                       </Col>
                                       <Form.Label column sm="2">
                                           max wait (sec)
                                       </Form.Label>
                                       <Col sm="3">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._audit_point_max_wait_time = c}
                                                         onChange={() => {
                                                             this.setConfig({AUDIT_POINT_VALIDATION_WAIT_TIME_MAX: this._audit_point_max_wait_time.value});
                                                         }}
                                                         value={this.props.config.AUDIT_POINT_VALIDATION_WAIT_TIME_MAX}/>
                                       </Col>
                                   </Form.Group>
                               </Form>
                           </Row>
                           <Row>
                               <Form>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="12">
                                           address version
                                       </Form.Label>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           version
                                       </Form.Label>
                                       <Col sm="6">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._address_version_name = c}
                                                         onChange={() => {
                                                             this.setState({address_version_name: this._address_version_name.value});
                                                         }}
                                                         value={this.state.address_version_name}/>
                                       </Col>
                                       <Form.Label column sm="2">
                                           default address
                                       </Form.Label>
                                       <Col sm="2">
                                           <div className="btn-group">
                                               <button data-toggle="dropdown"
                                                       className="btn btn-accent dropdown-toggle"
                                                       aria-expanded="false">{this.state.address_is_default ? 'yes' : 'no'} <span className="caret"/>
                                               </button>
                                               <ul className="dropdown-menu">
                                                   {Array.from([
                                                       'yes',
                                                       'no'
                                                   ]).map(type =>
                                                       <li><a key={type}
                                                              href="#"
                                                              onClick={() => {
                                                                  this.setState({address_is_default: type === 'yes'});
                                                              }}>{type}</a></li>
                                                   )}
                                               </ul>
                                           </div>
                                       </Col>
                                   </Form.Group>
                                   <Form.Group as={Row}>
                                       <Form.Label column sm="2">
                                           regex
                                       </Form.Label>
                                       <Col sm="8">
                                           <Form.Control type="text" placeholder=""
                                                         ref={(c) => this._address_version_regex = c}
                                                         onChange={() => {
                                                             this.setState({address_version_regex: this._address_version_regex.value});
                                                         }}
                                                         value={this.state.address_version_regex}/>
                                       </Col>
                                       <Col sm="2">
                                           <Button variant="light" className={"btn btn-w-sm btn-accent"}
                                                   size={'sm'}
                                                   onClick={this.addAddressVersion.bind(this)}>
                                               <FontAwesomeIcon icon="plus"
                                                                size="1x"/>
                                           </Button>
                                       </Col>
                                   </Form.Group>
                               </Form>
                               <div style={{
                                   width   : '100%',
                                   overflow: 'auto'
                               }}>
                                   <Table striped bordered hover
                                          variant="dark">
                                       <thead>
                                       <tr>
                                           <th style={{width: 185}}>version</th>
                                           <th>regex pattern</th>
                                           <th>default address</th>
                                           <th></th>
                                       </tr>
                                       </thead>
                                       <tbody>
                                       {this.props.wallet.address_version_list.map((addressVersion, idx) => {
                                           return (
                                               <tr key={idx} className="table-row">
                                                   <td>{addressVersion.version}</td>
                                                   <td>{addressVersion.regex_pattern}</td>
                                                   <td>{addressVersion.is_default === 1 ? 'yes' : 'no'}</td>
                                                   <td>
                                                       <Button variant="light" className={"btn btn-w-sm btn-accent"}
                                                               size={'sm'}
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
                           </Row>
                       </div>
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
