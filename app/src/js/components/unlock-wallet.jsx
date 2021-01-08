import React from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, FormControl, Row} from 'react-bootstrap';
import eventBus from '../../../../deps/millix-node/core/event-bus';
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
                <Button variant="light" className={'btn btn-w-md btn-accent'}
                        style={{
                            float     : 'left',
                            marginLeft: '12px'
                        }} onClick={() => {
                    props.history.replace('/newWallet/', {walletExists: true});
                }}>
                    <FontAwesomeIcon icon="plus" size="1x"/> manage wallet
                </Button>
            </Row>
            <div className="container-center lg">
                <div className="view-header">
                    <div className="header-icon">
                        <i className="pe page-header-icon pe-7s-unlock"></i>
                    </div>
                    <div className="header-title">
                        <h3>millix</h3>
                        <small>
                            please enter your password to unlock your wallet.
                        </small>
                    </div>
                </div>

                <div className="panel panel-filled">
                    <div className="panel-body">

                        <div className="form-group">
                            <label className="control-label"
                                   htmlFor="password">password</label>
                            <FormControl
                                ref={c => passphraseRef = c}
                                type="password"
                                placeholder="wallet passphrase"
                                aria-label="wallet passphrase"
                                aria-describedby="basic-addon"
                                onKeyPress={(e) => {
                                    if (e.charCode === 13) {
                                        eventBus.emit('wallet_key', passphraseRef.value);
                                    }
                                }}
                            />
                            {props.wallet.authenticationError ? (
                                <span className="help-block small">there was a problem authenticating your key file. retry your passphrase or click here to load your key.</span>) : (
                                 <span className="help-block small">Your strong password</span>)}
                        </div>
                        <Row>
                            <Col style={styles.centered}>
                                <Button variant="light"
                                        className={'btn btn-w-md btn-accent'}
                                        onClick={() => {
                                            eventBus.emit('wallet_key', passphraseRef.value);
                                        }} disabled={!props.wallet.isReady}>
                                    {!props.wallet.isReady && <div style={{
                                        fontSize: '6px',
                                        float   : 'left'
                                    }} className="loader-spin"/>}
                                    {!props.wallet.isReady ? ' loading...' : 'login'}</Button>
                            </Col>
                        </Row>

                    </div>
                </div>
            </div>
            {props.wallet.notification_message && (props.wallet.notification_message.is_sticky || props.wallet.notification_message.timestamp + 10000 >= Date.now()) &&
             props.wallet.notification_message.message.split('\n').map((message, idx) =>
                 <Row key={'message_' + idx}>
                     <Col style={{
                         ...styles.centered,
                         marginTop: idx === 0 ? 30 : 0
                     }}>
                         <small>
                             {message}
                         </small>
                     </Col>
                 </Row>)}
        </Container>
    );
};


export default connect(
    state => ({
        wallet: state.wallet
    })
)(UnlockWallet);
