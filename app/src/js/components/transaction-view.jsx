import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Col, Form, FormControl, InputGroup, Row, Spinner} from 'react-bootstrap';
import {walletUpdateAddresses} from '../redux/actions/index';
import {withRouter} from 'react-router-dom';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import database from '../../../../deps/millix-node/database/database';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};


class TransactionView extends Component {

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

    UNSAFE_componentWillMount() {
        this.props.walletUpdateAddresses(this.props.wallet.id);
    }

    getAddressBalance() {
        for (let item of this.props.wallet.addresses) {
            if (item.address == this.address) {
                return item.balance || 0;
            }
        }
        return 0;
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
            amount = parseInt(this.amount.value.replace(/[,.]/g, ""));
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

        wallet.addTransaction(this.address, [
            {
                address_base          : destinationAddress,
                address_version       : destinationAddressVersion,
                address_key_identifier: destinationAddressIdentifier,
                amount
            }
        ])
              .then(() => this.props.walletUpdateAddresses(this.props.wallet.id))
              .then(() => this.props.history.goBack())
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
        let amount      = e.target.value.replace(/[,.]/g, "");
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
                <Row className="mb-3">
                    <Col>
                        <Form>
                            <InputGroup className="mb-3">
                                <FormControl
                                    type="span"
                                    aria-describedby="basic-addon"
                                    defaultValue={this.fullAddress}
                                    disabled
                                />
                                <InputGroup.Append>
                                    <InputGroup.Text
                                        id="basic-addon">balance: {this.getAddressBalance().toLocaleString()} millix</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                            <Form.Group>
                                <Form.Label>destination address</Form.Label>
                                <Form.Control type="text"
                                              placeholder="enter destination address"
                                              ref={c => this.destinationAddress = c}/>
                                {this.state.addressError && (
                                    <Form.Text className="text-muted"><small
                                        style={{color: 'red'}}>invalid address.
                                        please, set a correct
                                        value.</small></Form.Text>)}
                                <Form.Text className="text-muted">please
                                    carefully confirm the destination address
                                    before sending. if you send to an invalid
                                    address you will lose your
                                    millix.</Form.Text>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>amount of millix</Form.Label>
                                <Form.Control type="text" placeholder="amount"
                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                              ref={c => this.amount = c}
                                              onChange={this.handleAmountValueChange.bind(this)}/>
                                {this.state.amountError && (
                                    <Form.Text className="text-muted"><small
                                        style={{color: 'red'}}>invalid amount.
                                        please, set a correct
                                        value.</small></Form.Text>)}
                            </Form.Group>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col style={styles.centered}>
                        {this.state.connectionError && (
                            <Form.Text className="text-muted"><small
                                style={{color: 'red'}}>invalid network state.
                                could not send the
                                transaction.</small></Form.Text>)}
                    </Col>
                </Row>
                <Row>
                    <Col style={styles.centered}>
                        <Button variant="light" onClick={this.send.bind(this)}
                                disabled={this.state.sending}>
                            {this.state.sending && <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />}
                            send millix
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    }),
    {
        walletUpdateAddresses
    }
)(withRouter(TransactionView));
