import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {Button, Col, Row} from 'react-bootstrap';
import {clearTransactionDetails, updateTransactionDetails} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import genesisConfig from '../../../../deps/millix-node/core/genesis/genesis-config';
import moment from 'moment';


class TransactionDetails extends Component {
    constructor(props) {
        super(props);
    }

    UNSAFE_componentWillMount() {
        if (!this.props.transaction) {
            this.props.updateTransactionDetails(decodeURIComponent(this.props.match.params.transaction_id));
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        let transactionID = decodeURIComponent(nextProps.match.params.transaction_id);
        if (this.props.transaction && transactionID !== this.props.transaction.transaction_id) {
            this.props.clearTransactionDetails();
            this.props.updateTransactionDetails(transactionID);
        }
    }

    render() {
        let {transaction} = this.props;
        return (
                <div>
                    <Row className="mb-3 mt-3">
                        <Col className="pl-0" style={{
                            display: 'flex',
                            justifyContent: 'flex-start'
                        }}>
                            <Button variant="outline-secondary"
                                    onClick={this.props.history.goBack}>
                                <FontAwesomeIcon icon="arrow-circle-left"
                                                 size="2x"/>
                                <span style={{
                                    position: 'relative',
                                    top: -5,
                                    marginRight: 10,
                                    marginLeft: 10
                                }}> Back</span>
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <span>Transaction ID: {decodeURIComponent(this.props.match.params.transaction_id)}</span>
                    </Row>
                    {transaction && transaction.transaction_id && (
                            <div>
                                <Row className="mb-3">
                                    <span>Content Hash: {transaction.content_hash}</span>
                                </Row>
                                <Row className="mb-3" style={{color: 'lightcyan'}}>
                                    <h5>Parent Transactions:</h5>
                                </Row>

                                {transaction.transaction_parent_list && transaction.transaction_parent_list.map((parent, idx) =>
                                        <Row className="mb-3"
                                             key={'transaction_parent_' + idx}>
                                            {parent !== genesisConfig.genesis_transaction ? (
                                                    <Link
                                                            to={'/transaction/' + encodeURIComponent(parent)}
                                                            style={{color: 'darkturquoise'}}>
                                                        {parent}
                                                    </Link>
                                            ) : (
                                                    <span>{parent} (Genesis)</span>
                                            )}
                                        </Row>)}
                                <Row className="mb-3" style={{color: 'lightcyan'}}>
                                    <h5>Inputs</h5>
                                </Row>
                                {transaction.transaction_input_list && transaction.transaction_input_list.map((input, idx) =>
                                        <div key={'transaction_input_' + idx}>
                                            <Row className="mb-3">
                                                {input.output_transaction_id !== genesisConfig.genesis_transaction ? (
                                                        <span>Transaction: <Link
                                                                to={'/transaction/' + encodeURIComponent(input.output_transaction_id)}
                                                                style={{color: 'darkturquoise'}}>
                                            {input.output_transaction_id}
                                        </Link></span>
                                                ) : (
                                                        <span>{input.output_transaction_id} (Genesis)</span>
                                                )}
                                            </Row>
                                            <Row className="mb-3">
                                                <span>Output Index: {input.output_position}</span>
                                            </Row>
                                            <Row className="mb-3">
                                                <span>Input Index: {input.input_position}</span>
                                            </Row>
                                            <Row className="mb-3">
                                                <span>Address: {input.address_base + input.address_version + input.address_key_identifier}</span>
                                            </Row>
                                        </div>
                                )}
                                <Row className="mb-3" style={{color: 'lightcyan'}}>
                                    <h5>Outputs</h5>
                                </Row>
                                {transaction.transaction_output_list && transaction.transaction_output_list.map((output, idx) =>
                                        <div key={'transaction_output_' + idx}>
                                            <Row className="mb-3">
                                                <span>Output Index: {output.output_position}</span>
                                            </Row>
                                            <Row className="mb-3">
                                                <span>Address: {output.address_base + output.address_version + output.address_key_identifier}</span>
                                            </Row>
                                            <Row className="mb-3">
                                                <span>Amount: {output.amount.toLocaleString()}</span>
                                            </Row>
                                        </div>
                                )}
                                <Row className="mb-3">
                                    <span>Date: {moment.utc(transaction.transaction_date).format('YYYY-MM-DD HH:mm:ss')}</span>
                                </Row>
                                <Row className="mb-3">
                                    <span>Host: {transaction.ip_address_origin}</span>
                                </Row>
                            </div>
                    )}
                </div>
        );
    }
}


export default connect(
        state => ({
            transaction: state.transactionDetails
        }),
        {
            clearTransactionDetails,
            updateTransactionDetails
        })(withRouter(TransactionDetails));
