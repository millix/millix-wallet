import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Dropdown, DropdownButton, Form, Row, Table} from 'react-bootstrap';
import {addWalletAddressVersion, walletUpdateConfig, removeWalletAddressVersion} from '../redux/actions/index';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class ConfigView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address_version_name : '',
            address_version_regex: '',
            address_is_default: false
        };
    }

    setConfig(data) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });
        this.props.walletUpdateConfig(data);
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

    render() {
        return (
            <div>
                <Row>
                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm="1">
                                debug
                            </Form.Label>

                            <Col sm="10">
                                <DropdownButton variant="secondary"
                                                title={this.props.config.MODE_DEBUG ? 'on' : 'off'}>
                                    {Array.from([
                                        'on',
                                        'off'
                                    ]).map(type =>
                                        <Dropdown.Item key={type} href="#"
                                                       onClick={() => {
                                                           this.setConfig({MODE_DEBUG: type === 'on'});
                                                       }}>{type}</Dropdown.Item>
                                    )}
                                </DropdownButton>

                            </Col>
                        </Form.Group>
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
                                node dns
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
                                public
                            </Form.Label>
                            <Col sm="2">
                                <DropdownButton variant="secondary"
                                                title={this.props.config.NODE_PUBLIC ? 'yes' : 'no'}>
                                    {Array.from([
                                        'yes',
                                        'no'
                                    ]).map(type =>
                                        <Dropdown.Item key={type} href="#"
                                                       onClick={() => {
                                                           this.setConfig({NODE_PUBLIC: type === 'yes'});
                                                       }}>{type}</Dropdown.Item>
                                    )}
                                </DropdownButton>
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
                                                  this.setConfig({NODE_INITIAL_LIST: this._nodes.value.split(',')});
                                              }}
                                              value={this.props.config.NODE_INITIAL_LIST}/>
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
                                              ref={(c) => this._audit_point_transaction_prune_min_age = c}
                                              onChange={() => {
                                                  this.setConfig({AUDIT_POINT_TRANSACTION_PRUNE_AGE_MIN: this._audit_point_transaction_prune_min_age.value});
                                              }}
                                              value={this.props.config.AUDIT_POINT_TRANSACTION_PRUNE_AGE_MIN}/>
                            </Col>

                            <Form.Label column sm="2">
                                total transactions to prune (512 max.)
                            </Form.Label>
                            <Col sm="3">
                                <Form.Control type="text" placeholder=""
                                              ref={(c) => this._audit_point_transaction_prune_count = c}
                                              onChange={() => {
                                                  this.setConfig({AUDIT_POINT_TRANSACTION_PRUNE_COUNT: Math.min(parseInt(this._audit_point_transaction_prune_count.value), 512).toString()});
                                              }}
                                              value={this.props.config.AUDIT_POINT_TRANSACTION_PRUNE_COUNT}/>
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
                                <DropdownButton variant="secondary"
                                                title={this.props.config.WALLET_SPENT_TRANSACTION_PRUNE ? 'yes' : 'no'}>
                                    {Array.from([
                                        'yes',
                                        'no'
                                    ]).map(type =>
                                        <Dropdown.Item key={type} href="#"
                                                       onClick={() => {
                                                           this.setConfig({WALLET_SPENT_TRANSACTION_PRUNE: type === 'yes'});
                                                       }}>{type}</Dropdown.Item>
                                    )}
                                </DropdownButton>
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
                                <DropdownButton variant="secondary"
                                                title={this.state.address_is_default ? 'yes' : 'no'}>
                                    {Array.from([
                                        'yes',
                                        'no'
                                    ]).map(type =>
                                        <Dropdown.Item key={type} href="#"
                                                       onClick={() => {
                                                           this.setState({address_is_default: type === 'yes'});
                                                       }}>{type}</Dropdown.Item>
                                    )}
                                </DropdownButton>
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
                                <Button variant={'secondary'}
                                        onClick={this.addAddressVersion.bind(this)}>
                                    <FontAwesomeIcon icon="plus" size="1x"/>
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
                                return (<tr key={idx} className="table-row">
                                    <td>{addressVersion.version}</td>
                                    <td>{addressVersion.regex_pattern}</td>
                                    <td>{addressVersion.is_default === 1 ? 'yes' : 'no'}</td>
                                    <td>
                                        <Button variant={'danger'}
                                                size={'sm'}
                                                onClick={() => this.props.removeWalletAddressVersion(addressVersion)}>
                                            <FontAwesomeIcon icon="trash"
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
        );
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
