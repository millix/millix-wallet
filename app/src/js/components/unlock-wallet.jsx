import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, InputGroup, Row, Spinner} from 'react-bootstrap';
import event_bus from '../../../../deps/millix-node/core/event-bus';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const styles       = {
    centered: {
        display       : 'flex',
        justifyContent: 'center'
    }
};
const UnlockWallet = (props) => {

    if (props.wallet.unlocked) {
        const {from} = props.location.state || {from: {pathname: '/'}};
        return <Redirect to={from}/>;
    }
    else if (props.wallet.isNew) {
        return <Redirect to={{pathname: '/newWallet/'}}/>;
    }

    let passphraseRef;
    return (
        <Container style={{
            marginTop  : 50,
            paddingLeft: 25
        }}>
            <Row className="mb-3">
                <Button variant="outline-secondary" style={{
                    float     : 'left',
                    marginLeft: '12px'
                }} onClick={() => {
                    props.history.replace('/newWallet/', {walletExists: true});
                }}>
                    <FontAwesomeIcon icon="plus" size="1x"/> manage wallet
                </Button>
                <Col style={{
                    ...styles.centered,
                    marginRight: '115px'
                }}><h2>unlock millix</h2></Col>
            </Row>
            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <FormControl
                            ref={c => passphraseRef = c}
                            type="password"
                            placeholder="wallet passphrase"
                            aria-label="wallet passphrase"
                            aria-describedby="basic-addon"
                            onKeyPress={(e) => {
                                if (e.charCode == 13) {
                                    event_bus.emit('wallet_key', passphraseRef.value);
                                }
                            }}
                        />
                        <InputGroup.Append>
                            <InputGroup.Text
                                id="basic-addon">passphrase</InputGroup.Text>
                        </InputGroup.Append>
                    </InputGroup>
                </Col>
            </Row>
            {props.wallet.authenticationError && (
                <Row>
                    <Col>
                        <small>there was a problem authenticating your key file.
                            retry your passphrase or click here to load your
                            key.</small>
                    </Col>
                </Row>
            )}
            <Row>
                <Col style={styles.centered}>
                    <Button variant="light" onClick={() => {
                        event_bus.emit('wallet_key', passphraseRef.value);
                    }} disabled={!props.wallet.isReady}>
                        {!props.wallet.isReady && <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />}
                        {!props.wallet.isReady ? ' loading...' : 'login'}</Button>
                </Col>
            </Row>
        </Container>
    );
};


export default connect(
    state => ({
        wallet: state.wallet
    })
)(UnlockWallet);
