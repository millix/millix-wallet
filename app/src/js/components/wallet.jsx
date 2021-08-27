import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row, Table} from 'react-bootstrap';
import {addNewAddress, walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import database from '../../../../deps/millix-node/database/database';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import {MDBDataTable as DataTable} from 'mdbreact';
import config from '../../../../deps/millix-node/core/config/config';

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
            addressList         : {
                columns: [
                    {
                        label: '#',
                        field: 'address_position',
                        width: 150
                    },
                    {
                        label: [
                            <FontAwesomeIcon icon="book" size="1x"/>,
                            ' address'
                        ],
                        field: 'address',
                        width: 270
                    }
                ],
                rows   : []
            },
            amountError         : false,
            feeError            : false,
            addressError        : false,
            sendTransactionError: false,
            sending             : false,
            canceling           : false,
            feesLocked          : true
        };

        this.feesInitialized = false;
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.state.addressList.rows.length !== this.props.wallet.addresses.length) {
            const rows = [...this.props.wallet.addresses];
            this.setState({
                addressList: {
                    columns: [...this.state.addressList.columns],
                    rows
                }
            });
        }
    }

    componentDidMount() {
        this.props.walletUpdateAddresses(this.props.wallet.id);
        this.props.walletUpdateBalance(this.props.wallet.address_key_identifier);
    }

    _getAmount(value, allowZero = false) {
        const pValue = parseInt(value.replace(/[,.]/g, ''));
        if ((allowZero ? pValue < 0 : pValue <= 0) || pValue.toLocaleString('en-US') !== value) {
            throw Error('invalid_value');
        }
        return pValue;
    }

    send() {

        if (this.state.sending) {
            wallet.interruptTransactionSendInProgress();
            this.setState({
                canceling: true
            });
            return;
        }

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
                  this.fees.value               = config.TRANSACTION_FEE_PROXY.toLocaleString('en-US');
                  this.setState({
                      sending: false
                  });
              })
              .catch((e) => {
                  let sendTransactionErrorMessage;
                  if (e.api_message) {
                      const match                 = /unexpected generic api error: \((?<message>.*)\)/.exec(e.api_message);
                      sendTransactionErrorMessage = `could not send the transaction(${match.groups.message})`;
                  }
                  else if (e === 'insufficient_balance') {
                      sendTransactionErrorMessage = 'your transaction could not be sent: insufficient millix balance';
                  }
                  else if (e === 'transaction_send_interrupt') {
                      sendTransactionErrorMessage = 'the transaction was canceled';
                  }
                  else {
                      sendTransactionErrorMessage = `could not send the transaction(${e.message || e.api_message || e})`;
                  }

                  this.setState({
                      sendTransactionError: true,
                      sending             : false,
                      canceling           : false,
                      sendTransactionErrorMessage
                  });
              });
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
        e.target.value = !isNaN(amount) ? amount.toLocaleString('en-US') : 0;

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
                                        <td>{this.props.wallet.balance_stable.toLocaleString('en-US')}</td>
                                        <td>{this.props.wallet.balance_pending.toLocaleString('en-US')}</td>
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
                                                className="control-label">fee</label>
                                            <Form.Group as={Row}>
                                                <Col md={11} ms={11}>
                                                    <Form.Control type="text"
                                                                  placeholder="fee"
                                                                  pattern="[0-9]+([,][0-9]{1,2})?"
                                                                  ref={c => {
                                                                      this.fees = c;
                                                                      if (this.fees && !this.feesInitialized) {
                                                                          this.feesInitialized = true;
                                                                          this.fees.value      = config.TRANSACTION_FEE_PROXY.toLocaleString('en-US');
                                                                      }
                                                                  }}
                                                                  onChange={this.handleAmountValueChange.bind(this)}
                                                                  disabled={this.state.feesLocked}/>
                                                </Col>
                                                <Col style={styles.centered}
                                                     md={1} ms={1}>
                                                    <Button
                                                        onClick={() => this.setState({feesLocked: !this.state.feesLocked})}>
                                                        <FontAwesomeIcon
                                                            icon={this.state.feesLocked ? 'lock' : 'lock-open'}
                                                            size="1x"/>
                                                    </Button>
                                                </Col>
                                                {this.state.feeError && (
                                                    <Form.Text
                                                        className="text-muted"><small
                                                        style={{color: 'red'}}>invalid
                                                        fee.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                            </Form.Group>
                                        </Col>
                                        <Col style={styles.centered}>
                                            <Button variant="light"
                                                    className={'btn btn-w-md btn-accent'}
                                                    onClick={this.send.bind(this)}
                                                    disabled={this.state.canceling}>
                                                {this.state.sending ?
                                                 <>
                                                     <div style={{
                                                         fontSize: '6px',
                                                         float   : 'left'
                                                     }}
                                                          className="loader-spin"/>
                                                     {this.state.canceling ? "canceling" : "cancel transaction"}
                                                 </> : <>send millix</>}
                                            </Button>
                                        </Col>
                                        <Col style={styles.centered}>
                                            {this.state.sendTransactionError && (
                                                <Form.Text
                                                    className="text-muted">{this.state.sendTransactionErrorMessage}.</Form.Text>)}
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading'}>addresses
                            </div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-3 mt-3">
                                    <Col className="pr-0" style={{
                                        display       : 'flex',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button variant="light"
                                                style={{width: 191.2}}
                                                className={'btn btn-w-md btn-accent'}
                                                onClick={() => {
                                                    this.props.addNewAddress(this.props.wallet.id).then(() => this.props.walletUpdateAddresses(this.props.wallet.id));
                                                }}>
                                            generate address
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <DataTable striped bordered small hover
                                               info={false}
                                               entries={10}
                                               entriesOptions={[
                                                   10,
                                                   30,
                                                   50
                                               ]}
                                               data={this.state.addressList}/>
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
