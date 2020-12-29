import React from 'react';
import {connect} from 'react-redux';
import {Link, Redirect, Route} from 'react-router-dom';
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
                            <Link class="navbar-brand" to={{pathname:'/wallet'}}>
                                millix
                                <span>v.{rest.config.NODE_MILLIX_VERSION}</span>
                            </Link>
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
                            <Col md="10">
                                <Component {...props} />
                            </Col>
                            <Col md="2">
                                <div className={'panel panel-filled'}>
                                    <div className={'panel-heading'}>status
                                    </div>
                                    <hr className={'hrPanel'}/>
                                    <div className={'panel-body'}>
                                        {rest.config.MODE_TEST_NETWORK && (<Row>
                                            <Col className="pr-0"
                                                 style={{textAlign: 'left'}}>
                                                <span>millix testnet</span>
                                                <hr/>
                                            </Col>
                                        </Row>)}
                                        <Row>
                                            <Col className="pr-0"
                                                 style={{textAlign: 'left'}}>
                                                <span>event log size: {rest.log.size}</span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-0"
                                                 style={{textAlign: 'left'}}>
                                                <span>backlog size: {rest.backlog.size}</span>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col className="pr-0"
                                                 style={{textAlign: 'left'}}>
                                                <Button variant="link"
                                                        onClick={() => props.history.push('/peers')}
                                                        style={{
                                                            padding    : 0,
                                                            borderWidth: '0rem'
                                                        }}>
                                                    connections: {rest.network.connections}</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                        </div>
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
