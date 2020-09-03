import React, {Component} from 'react';
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
            amountError    : false,
            addressError   : false,
            connectionError: false,
            sending        : false
        };
    }

    componentDidMount() {
        this.props.walletUpdateAddresses(this.props.wallet.id);
        this.props.walletUpdateBalance(this.props.wallet.address_key_identifier);
    }

    send() {

        this.setState({connectionError: false});

        let {
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

        this.setState({addressError: false});

        let amount;
        try {
            amount = parseInt(this.amount.value.replace(/[,.]/g, ''));
            if (amount <= 0 || amount.toLocaleString() != this.amount.value) {
                this.setState({amountError: true});
                return;
            }
        }
        catch (e) {
            this.setState({amountError: true});
            return;
        }

        this.setState({
            amountError: false,
            sending    : true
        });

        wallet.addTransaction([
            {
                address_base          : destinationAddress,
                address_version       : destinationAddressVersion,
                address_key_identifier: destinationAddressIdentifier,
                amount
            }
        ])
              .then(() => this.props.walletUpdateAddresses(this.props.wallet.id))
              .then(() => this.props.walletUpdateBalance(this.props.wallet.address_key_identifier))
              .then(() => {
                  this.destinationAddress.value = '';
                  this.amount.value             = '';
                  this.setState({
                      sending: false
                  });
              })
              .catch(() => this.setState({
                  connectionError: true,
                  sending        : false
              }));
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
        e.target.value = parseInt(amount).toLocaleString();

        e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={10} className={'col-md-offset-1'}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-body'}>
                                <Row className="mb-1">
                                    <Col style={styles.left}>
                                        <Form.Label>balance</Form.Label>
                                    </Col>
                                </Row>
                                <Row className="mb-1">
                                    <Col style={styles.left}>
                                        <span>available: {this.props.wallet.balance_stable.toLocaleString()}</span>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col style={styles.left}>
                                        <span>pending: {this.props.wallet.balance_pending.toLocaleString()}</span>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <Form>
                                            <Form.Group>
                                                <Form.Label>destination
                                                    address</Form.Label>
                                                <Form.Control type="text"
                                                              placeholder="enter destination address"
                                                              ref={c => this.destinationAddress = c}/>
                                                {this.state.addressError && (
                                                    <Form.Text
                                                        className="text-muted"><small
                                                        style={{color: 'red'}}>invalid
                                                        address.
                                                        please, set a correct
                                                        value.</small></Form.Text>)}
                                                <Form.Text
                                                    className="text-muted">please
                                                    carefully confirm the
                                                    destination
                                                    address
                                                    before sending. if you send
                                                    to
                                                    an
                                                    invalid
                                                    address you will lose your
                                                    millix.</Form.Text>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>amount of
                                                    millix</Form.Label>
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
                                        </Form>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={styles.centered}>
                                        {this.state.connectionError && (
                                            <Form.Text
                                                className="text-muted"><small
                                                style={{color: 'red'}}>invalid
                                                network
                                                state.
                                                could not send the
                                                transaction.</small></Form.Text>)}
                                    </Col>
                                </Row>
                                <Row>
                                    <Col style={styles.centered}>
                                        <Button variant="light"
                                                className={'btn btn-w-md btn-accent'}
                                                onClick={this.send.bind(this)}
                                                disabled={this.state.sending}>
                                            {this.state.sending && <div style={{fontSize: "6px", float: 'left'}} className="loader-spin"/>}
                                            send millix
                                        </Button>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
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
                            show more addresses
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
