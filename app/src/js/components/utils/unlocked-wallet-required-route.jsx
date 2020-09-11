import React from 'react';
import {connect} from 'react-redux';
import {Redirect, Route} from 'react-router-dom';
import {updateNetworkState} from '../../redux/actions';
import Sidebar from '../sidebar';
import {Button, Col, Container, Form, Row} from 'react-bootstrap';
import Switch from 'react-switchery';
import '../../../../node_modules/mohithg-switchery/switchery.css';


const UnlockedWalletRequiredRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        rest.wallet.unlocked ? (
            <>
                <nav class="navbar navbar-default navbar-fixed-top">
                    <div class="container-fluid">
                        <div class="navbar-header">
                            <div id="mobile-menu">
                                <div class="left-nav-toggle">
                                    <a href="#"
                                       onClick={() => $('body').toggleClass('nav-toggle')}>
                                        <i class="stroke-hamburgermenu"></i>
                                    </a>
                                </div>
                            </div>
                            <a class="navbar-brand" href="#">
                                millix
                                <span>v.{rest.config.NODE_MILLIX_VERSION}</span>
                            </a>
                        </div>
                        <div id="navbar" class="navbar-collapse collapse">
                            <div class="left-nav-toggle">
                                <a href="#"
                                   onClick={() => $('body').toggleClass('nav-toggle')}>
                                    <i class="stroke-hamburgermenu"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>
                <Sidebar {...rest} {...props}/>
                <section className={'content'}>
                    <Container fluid={true}>
                        <div>
                            <div >
                                {rest.config.MODE_TEST_NETWORK && (<Row>
                                    <Col className="pr-0"
                                         style={{textAlign: 'right'}}>
                            <span
                                style={{
                                    fontSize: '85%',
                                    color   : 'red'
                                }}>Millix Testnet</span>
                                    </Col>
                                </Row>)}
                                <Row>
                                    <Col className="pr-0"
                                         style={{textAlign: 'right'}}>
                            <span
                                style={{fontSize: '75%'}}>event log size: {rest.log.size}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="pr-0"
                                         style={{textAlign: 'right'}}>
                            <span
                                style={{fontSize: '75%'}}>backlog size: {rest.backlog.size}</span>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col className="pr-0"
                                         style={{textAlign: 'right'}}>
                                        <Button variant="link"
                                                onClick={() => props.history.push('/peers')}
                                                style={{
                                                    fontSize: '75%',
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
                                        <Switch
                                            className={'switch-class network-switch'}
                                            id="networkSwitch"
                                            onChange={(checked) => rest.updateNetworkState(checked)}
                                            options={
                                                {
                                                    color: '#C741FC',
                                                    size : 'small'
                                                }
                                            }
                                            label={rest.network.enabled ? 'online node' : 'offline node'}
                                            checked={rest.network.enabled}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <Component {...props} />
                    </Container>
                </section>
            </>
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
