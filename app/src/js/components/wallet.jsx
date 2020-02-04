import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {addNewAddress, walletUpdateAddresses} from '../redux/actions/index';

const styles = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};


class Wallet extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.walletUpdateAddresses(this.props.wallet.id);
    }

    render() {
        return (
            <div>
                <Row className="mb-3 mt-3">
                    <Col className="pr-0" style={{
                        ...styles.centered,
                        display       : 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <Button variant="outline-secondary" onClick={() => {
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
                                <th>available balance</th>
                                <th>pending balance</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.props.wallet.addresses.map((item, idx) => {
                                return (<tr key={idx} className="wallet-address"
                                            onClick={() => {
                                                this.props.history.push('/address/' + item.address, {address: item});
                                            }}>
                                    <td>{idx}</td>
                                    <td>{item.address}</td>
                                    <td style={{color: 'green'}}>{item.balance.toLocaleString()}</td>
                                    <td style={{color: 'orange'}}>{item.pendingBalance == undefined ? 0 : item.pendingBalance.toLocaleString()}</td>
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
        addNewAddress
    }
)(withRouter(Wallet));
