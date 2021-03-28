import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';
import {Button, Col, Container, Row, Spinner} from 'react-bootstrap';
import PasswordInputView from './utils/password-input-view';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import database from '../../../../deps/millix-node/database/database';
import eventBus from '../../../../deps/millix-node/core/event-bus';
import fs from 'fs';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import async from 'async';

const STATUS = {
    SELECT       : 0,
    NEW_WALLET   : 1,
    IMPORT_WALLET: 2
};


class NewWallet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fileKeyImport: new Date().getTime(),
            status       : STATUS.SELECT
        };
        this.passphraseRef;
    }

    onPassword(password) {
        let status = this.props.wallet.isImportWallet ? STATUS.IMPORT_WALLET : this.state.status;

        if (status === STATUS.NEW_WALLET) {
            if (this.props.location.state && this.props.location.state.walletExists) {
                walletUtils.removeMnemonic()
                           .then(() => {
                               eventBus.emit('wallet_reload', () => {
                                   eventBus.emit('wallet_key', password);
                               });
                           });
            }
            else {
                eventBus.emit('wallet_key', password);
            }
        }
        else if (status === STATUS.IMPORT_WALLET) {
            eventBus.emit('wallet_reload', () => {
                eventBus.emit('wallet_key', password);
            });
        }
    }

    importKey() {

        if (this.inputImport.value === '') {
            this.setState({importingWallet: false});
            return;
        }

        console.log('importing keys from ', this.inputImport.value);

        fs.readFile(this.inputImport.value, 'utf8', (err, dataString) => {
            if (err) {
                this.setState({importingWallet: false});
                return reject('Couldn\'t read wallet mnemonic');
            }

            const data = JSON.parse(dataString);
            if (data.mnemonic_phrase) {
                walletUtils.storeMnemonic(data.mnemonic_phrase, true)
                           .then(() => wallet.stop())
                           .then(() =>
                               new Promise(resolve => {
                                   async.each(data.addresses, (entry, callback) => {
                                       database.getRepository('keychain')
                                               .addAddress(entry.wallet_id, entry.is_change, entry.address_position, entry.address_base, entry.address_version, entry.address_key_identifier, entry.address_attribute)
                                               .then(callback).catch(callback);
                                   }, () => resolve());
                               })
                           )
                           .then(() => {
                               this.setState({
                                   importingWallet: false,
                                   status         : STATUS.IMPORT_WALLET
                               });
                           });
            }
            else {
                this.setState({importingWallet: false});
                return reject('Couldn\'t read nor create master key');
            }
        });

        this.setState({fileKeyImport: new Date().getTime()});
    }

    render() {
        if (this.props.wallet.unlocked) {
            return <Redirect to={{pathname: '/'}}/>;
        }

        let status = this.props.wallet.isImportWallet ? STATUS.IMPORT_WALLET : this.state.status;
        return (
            <Container style={{
                marginTop  : 50,
                paddingLeft: 25
            }}>
                <Row className="mb-3">
                    {this.props.location.state && this.props.location.state.walletExists && (
                        <Button variant="light"
                                className={'btn btn-w-md btn-accent'} style={{
                            float     : 'left',
                            marginLeft: '80px'
                        }} onClick={() => {
                            this.props.history.replace('/unlock/');
                        }}>
                            <FontAwesomeIcon icon="fingerprint"
                                             size="1x"/> unlock
                        </Button>)}

                </Row>

                {status === STATUS.SELECT && (
                    <div className="container-center lg">
                        <Row>
                            <Col sm={6} style={{textAlign: 'right'}}>
                                <Button variant="light"
                                        className={'btn btn-w-md btn-accent'}
                                        style={{
                                            width        : '80%',
                                            paddingTop   : '14.66%',
                                            paddingBottom: '20.66%'
                                        }} onClick={() => {
                                    this.setState({status: STATUS.NEW_WALLET});
                                }}>
                                    <FontAwesomeIcon icon="wallet" size="8x"
                                                     style={{
                                                         margin : '0 auto',
                                                         display: 'block'
                                                     }}/> new wallet
                                </Button>
                            </Col>
                            <Col sm={6}>
                                <input style={{display: 'none'}} type="file"
                                       accept=".json"
                                       ref={(component) => this.inputImport = component}
                                       onChange={this.importKey.bind(this)}
                                       key={this.state.fileKeyImport}/>
                                <Button variant="light"
                                        className={'btn btn-w-md btn-accent'}
                                        style={{
                                            width        : '80%',
                                            paddingTop   : '24.3%',
                                            paddingBottom: '18.66%'
                                        }} onClick={() => {
                                    this.inputImport.click();
                                    this.setState({importingWallet: true});
                                }}>
                                    <FontAwesomeIcon icon="key" size="6x"
                                                     style={{
                                                         margin : '0 auto',
                                                         display: 'block'
                                                     }}/>
                                    {this.state.importingWallet && (
                                        <Spinner
                                            as="span"
                                            animation="grow"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />)}
                                    {this.state.importingWallet ? ('loading wallet') : ('load wallet')}
                                </Button>
                            </Col>
                        </Row>
                    </div>
                )}
                {status === STATUS.NEW_WALLET && (
                    <PasswordInputView onPassword={this.onPassword.bind(this)}
                                       newWallet={true}/>
                )}
                {status === STATUS.IMPORT_WALLET && (
                    <PasswordInputView onPassword={this.onPassword.bind(this)}
                                       newWallet={false}/>
                )}
            </Container>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(NewWallet);
