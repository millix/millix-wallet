import React from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';
import {updateNetworkState} from '../../redux/actions';
import Sidebar from '../sidebar';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';


const UnlockedWalletRequiredRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        rest.wallet.unlocked ? (
            <Container>
                <Sidebar {...rest} {...props}/>
                {rest.config.MODE_TEST_NETWORK && (<Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <span
                            style={{
                                fontSize: '85%',
                                color   : 'red'
                            }}>Millix Testnet</span>
                    </Col>
                </Row>)}
                <Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <span
                            style={{fontSize: '55%'}}>millix v.{rest.config.NODE_MILLIX_VERSION}</span>
                    </Col>
                </Row>
                {!!rest.wallet.version_available && rest.config.NODE_MILLIX_VERSION !== rest.wallet.version_available &&
                 (<Row>
                     <Col className="pr-0" style={{textAlign: 'right'}}>
                         <Button variant="link"
                                 onClick={() => nw.Shell.openExternal('https://millix.org/client.html')}
                                 style={{
                                     fontSize: '75%',
                                     padding : 0,
                                     color   : '#ffadad'
                                 }}>new version available
                             v.{rest.wallet.version_available} !</Button>
                     </Col>
                 </Row>)}
                <Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <span
                            style={{fontSize: '75%'}}>{rest.clock}</span>
                    </Col>
                </Row>
                <Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <span
                            style={{fontSize: '75%'}}>event log size: {rest.log.size}</span>
                    </Col>
                </Row>
                <Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <span
                            style={{fontSize: '75%'}}>backlog size: {rest.backlog.size}</span>
                    </Col>
                </Row>
                <Row>
                    <Col className="pr-0" style={{textAlign: 'right'}}>
                        <Button variant="link"
                                onClick={() => props.history.push('/peers')}
                                style={{
                                    fontSize: '75%',
                                    color   : 'white',
                                    padding : 0
                                }}>node
                            connections: {rest.network.connections}</Button>
                    </Col>
                </Row>
                <Row>
                    <Col className="pr-0 mb-3" style={{
                        display       : 'flex',
                        justifyContent: 'flex-end'
                    }}>
                        <Form.Check
                            type="switch"
                            id="networkSwitch"
                            label={rest.network.enabled ? 'online node' : 'offline node'}
                            style={{
                                fontSize: '75%',
                                color   : 'white',
                                padding : 0
                            }}
                            checked={rest.network.enabled}
                            onChange={(e) => rest.updateNetworkState(e.target.checked)}
                        />
                    </Col>
                </Row>
                <Component {...props} />
            </Container>
        ) : (
            <Redirect to={{
                pathname: '/unlock/',
                state   : {from: props.location}
            }}/>
        )
    )}/>
);

export default connect(
    state => ({
        clock  : state.clock,
        config : state.config,
        log    : state.log,
        network: state.network,
        wallet : state.wallet,
        backlog: state.backlog
    }), {
        updateNetworkState
    })(UnlockedWalletRequiredRoute);
