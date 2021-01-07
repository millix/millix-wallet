import React, {Component, useState} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, FormControl, InputGroup, Row, Spinner, Table} from 'react-bootstrap';
import {addNewAddress, walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import database from '../../../../deps/millix-node/database/database';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';

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

class Wallet extends Component {
    constructor(props) {
        super(props);
        this.address     = props.match.params.address;
        this.fullAddress = this.address;
        this.state       = {
            amountError         : false,
            feeError            : false,
            addressError        : false,
            sendTransactionError: false,
            sending             : false
        };

        this.feesInitialized = false;
    }

    componentDidMount() {
        this.props.walletUpdateAddresses(this.props.wallet.id);
        this.props.walletUpdateBalance(this.props.wallet.address_key_identifier);
    }

    _getAmount(value, allowZero = false) {
        const pValue = parseInt(value.replace(/[,.]/g, ''));
        if ((allowZero ? pValue < 0 : pValue <= 0) || pValue.toLocaleString() !== value) {
            throw Error('invalid_value');
        }
        return pValue;
    }

    send() {

        this.setState({
            sendTransactionError       : false,
            sendTransactionErrorMessage: null
        });

        const {
                  address   : destinationAddress,
                  identifier: destinationAddressIdentifier,
                  version   : destinationAddressVersion
              } = database.getRepository('address')
                          .getAddressComponent(this.destinationAddress.value.trim());
        try {
            if (!walletUtils.isValidAddress(destinationAddress) || !walletUtils.isValidAddress(destinationAddressIdentifier)) {
                this.setState({addressError: true});
                return;
            }
        }
        catch (e) {
            this.setState({addressError: true});
            return;
        }

        let amount;
        try {
            amount = this._getAmount(this.amount.value);
        }
        catch (e) {
            this.setState({
                amountError : true,
                addressError: false
            });
            return;
        }

        let fees;
        try {
            fees = this._getAmount(this.fees.value, true);
        }
        catch (e) {
            this.setState({
                feeError    : true,
                amountError : false,
                addressError: false
            });
            return;
        }

        this.setState({
            addressError: false,
            amountError : false,
            feeError    : false,
            sending     : true
        });

        wallet.addTransaction([
            {
                address_base          : destinationAddress,
                address_version       : destinationAddressVersion,
                address_key_identifier: destinationAddressIdentifier,
                amount
            }
        ], {
            fee_type: 'transaction_fee_default',
            amount  : fees
        })
              .then(() => this.props.walletUpdateAddresses(this.props.wallet.id))
              .then(() => this.props.walletUpdateBalance(this.props.wallet.address_key_identifier))
              .then(() => {
                  this.destinationAddress.value = '';
                  this.amount.value             = '';
                  this.fees.value               = '';
                  this.setState({
                      sending: false
                  });
              })
              .catch((e) => {
                  this.setState({
                      sendTransactionError       : true,
                      sendTransactionErrorMessage: e.message || e,
                      sending                    : false
                  });
              });
    }

    updateSuggestedFees() {
        this.fees.value = Math.floor(this.props.wallet.transaction_fee);
    }

    handleAmountValueChange(e) {
        if (e.target.value.length === 0) {
            return;
        }

        let cursorStart = e.target.selectionStart,
            cursorEnd   = e.target.selectionEnd;
        let amount      = e.target.value.replace(/[,.]/g, '');
        let offset      = 0;
        if ((amount.length - 1) % 3 === 0) {
            offset = 1;
        }

        amount         = parseInt(amount);
        e.target.value = !isNaN(amount) ? amount.toLocaleString() : 0;

        e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading'}>balance</div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>

                                <Table striped bordered hover variant="dark">
                                    <thead>
                                    <tr>
                                        <th>available</th>
                                        <th>pending</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr key="1" className="wallet-address">
                                        <td>{this.props.wallet.balance_stable.toLocaleString()}</td>
                                        <td>{this.props.wallet.balance_pending.toLocaleString()}</td>
                                    </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </div>

                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading'}>send</div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-3">
                                    <Form>
                                        <Col>
                                            <Form.Group>
                                                <label
                                                    className="control-label">address</label>
                                                <Form.Control type="text"
                                                              placeholder="address"
                                                              ref={c => this.destinationAddress = c}/>
                                                {this.state.addressError && (
                                                    <Form.Text
                                                        className="text-muted"><small
                                                        style={{color: 'red'}}>invalid
                                                        address.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <label
                                                className="control-label">amount</label>
                                            <Form.Group>
                                                <Form.Control type="text"
                                                              placeholder="amount"
                                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                                              ref={c => this.amount = c}
                                                              onChange={this.handleAmountValueChange.bind(this)}/>
                                                {this.state.amountError && (
                                                    <Form.Text
                                                        className="text-muted"><small
                                                        style={{color: 'red'}}>invalid
                                                        amount.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <label
                                                className="control-label">fees</label>
                                            <Form.Group as={Row}>
                                                <Col md={11} ms={11}>
                                                    <Form.Control type="text" placeholder="fees"
                                                                  pattern="[0-9]+([,][0-9]{1,2})?"
                                                                  ref={c => {
                                                                      this.fees = c;
                                                                      if (this.fees && !this.feesInitialized && this.props.wallet.transaction_fee > 0) {
                                                                          this.feesInitialized = true;
                                                                          this.fees.value      = Math.floor(this.props.wallet.transaction_fee);
                                                                      }
                                                                  }}
                                                                  onChange={this.handleAmountValueChange.bind(this)}/>
                                                </Col>
                                                <Col style={styles.centered} md={1} ms={1}>
                                                    <Button variant="outline-secondary"
                                                            onClick={this.updateSuggestedFees.bind(this)}>
                                                        <FontAwesomeIcon icon="undo" size="1x"/>
                                                    </Button>
                                                </Col>
                                                {this.state.feeError && (
                                                    <Form.Text className="text-muted"><small
                                                        style={{color: 'red'}}>invalid fee.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col style={styles.centered}>
                                            <Button variant="light"
                                                    className={'btn btn-w-md btn-accent'}
                                                    onClick={this.send.bind(this)}
                                                    disabled={this.state.sending}>
                                                {this.state.sending &&
                                                 <div style={{
                                                     fontSize: '6px',
                                                     float   : 'left'
                                                 }} className="loader-spin"/>}
                                                send millix
                                            </Button>
                                        </Col>
                                        <Col style={styles.centered}>
                                            {this.state.sendTransactionError && (
                                                <Form.Text className="text-muted"><small
                                                    style={{color: 'red'}}> could not send the
                                                    transaction
                                                    ({this.state.sendTransactionErrorMessage}).</small></Form.Text>)}
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading'}>addresses</div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-3 mt-3">
                                    <Col className="pr-0" style={{
                                        ...styles.centered,
                                        display       : 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button variant="light"
                                                className={'btn btn-w-md btn-accent'}
                                                onClick={() => {
                                                    this.props.addNewAddress(this.props.wallet.id).then(() => this.props.walletUpdateAddresses(this.props.wallet.id));
                                                }}>
                                            generate address
                                        </Button>
                                    </Col>
                                </Row>
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
                                                <th>address</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {this.props.wallet.addresses.map((item, idx) => {
                                                return (
                                                    <tr key={idx} className="wallet-address">
                                                        <td>{idx}</td>
                                                        <td>{item.address}</td>
                                                    </tr>);
                                            })}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>

            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }),
    {
        walletUpdateAddresses,
        addNewAddress,
        walletUpdateBalance
    }
)(withRouter(Wallet));
