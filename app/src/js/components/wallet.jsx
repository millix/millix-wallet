import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, FormControl, InputGroup, Row, Spinner, Table} from 'react-bootstrap';
import {addNewAddress, walletUpdateAddresses, walletUpdateBalance} from '../redux/actions/index';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import database from '../../../../deps/millix-node/database/database';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import DataTable, { createTheme } from 'react-data-table-component';
import styled from 'styled-components';

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

const data = [{ id: 1, title: 'Conan the Barbarian', year: '1982' },
              { id: 2, title: 'Conan the Barbarian2', year: '1982' },
              { id: 3, title: 'Conan the Barbarian3', year: '1982' }];
const columns = [
    {
        name: 'Title',
        selector: 'title',
        sortable: true,
    },
    {
        name: 'Year',
        selector: 'year',
        sortable: true,
        //right: true,
    },
];

const Buttons = styled.button`
  font-size: 10em;
  margin: 1em;
  padding: 0.25em 1em;
  border-radius: 3px;

  /* Color the border and text with theme.main */
  color: ${props => props.theme.main};
  border: 2px solid ${props => props.theme.main};
`;

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
        /*
         <Col md={12}>
         <DataTable
         title="Arnold Movies"
         columns={columns}
         data={data}
         />

         <Buttons>
         send millix
         </Buttons>
         </Col>
        * */
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading'}>balance</div>
                            <hr className={'hrPanel'}/>
                            <div className={'panel-body'}>
                                <Row className="mb-1">
                                    <Col style={styles.left}>
                                        <span
                                            className={'form-control'}>available: {this.props.wallet.balance_stable.toLocaleString()}</span>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col style={styles.left}>
                                        <span className={'form-control'}
                                              style={{backgroundColor: '#ffffff00'}}>pending: {this.props.wallet.balance_pending.toLocaleString()}</span>
                                    </Col>
                                </Row>
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
                                            {this.state.connectionError && (
                                                <Form.Text
                                                    className="text-muted"><small
                                                    style={{color: 'red'}}>invalid
                                                    network
                                                    state.
                                                    could not send the
                                                    transaction.</small></Form.Text>)}
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
