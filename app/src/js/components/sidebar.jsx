import React, {Component} from 'react';
import SideNav, {NavIcon, NavItem, NavText} from '@trendmicro/react-sidenav';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import eventBus from '../../../../deps/millix-node/core/event-bus';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import walletConsensus from '../../../../deps/millix-node/core/wallet/wallet-transaction-consensus';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import database from '../../../../deps/millix-node/database/database';
import fs from 'fs';
import async from 'async';


class Sidebar extends Component {
    constructor(props) {
        super(props);
        let now    = Date.now();
        this.state = {
            fileKeyExport: 'export_' + now,
            fileKeyImport: 'import_' + now
        };
    }

    exportKeys() {
        if (this.inputExport.value === '') {
            this.setState({exportingWallet: false});
            return;
        }

        console.log('saving keys to ', this.inputExport.value);

        walletUtils.loadMnemonic()
                   .then(([mnemonicPhrase, _]) => {
                       wallet.getWalletAddresses()
                             .then(addresses => {
                                 let json = JSON.stringify({
                                     mnemonic_phrase: mnemonicPhrase,
                                     addresses
                                 });
                                 fs.writeFile(this.inputExport.value, json, 'utf8', () => {
                                     this.setState({
                                         fileKeyExport  : 'export_' + Date.now(),
                                         exportingWallet: false
                                     });
                                 });
                             });
                   });
    }

    importKey() {
        let self = this;
        if (this.inputImport.value === '') {
            this.setState({importingWallet: false});
            return;
        }

        console.log('importing keys from ', this.inputImport.value);

        fs.readFile(this.inputImport.value, 'utf8', function(err, dataString) {
            if (err) {
                this.setState({importingWallet: false});
                return reject('Couldn\'t read wallet mnemonic');
            }

            const data = JSON.parse(dataString);
            if (data.mnemonic_phrase) {
                walletUtils.storeMnemonic(data.mnemonic_phrase, true)
                           .then(() =>
                               new Promise(resolve => {
                                   async.each(data.addresses, (entry, callback) => {
                                       database.getRepository('keychain')
                                               .addAddress(entry.wallet_id, entry.is_change, entry.address_position, entry.address_base, entry.address_version, entry.address_key_identifier, entry.address_attribute)
                                               .then(() => callback()).catch((e) => {
                                           console.log(e);
                                           callback();
                                       });
                                   }, () => resolve());
                               })
                           )
                           .then(() => {
                               self.setState({importingWallet: false});
                               eventBus.emit('wallet_lock', {isImportWallet: true});
                           });
            }
            else {
                self.setState({importingWallet: false});
                return reject('Couldn\'t read nor create master key');
            }
        });
        this.setState({fileKeyImport: 'import_' + Date.now()});
    }

    render() {
        let props = this.props;
        return (<div>
            <SideNav
                onSelect={(selected) => {
                    switch (selected) {
                        case 'loadWallet':
                            this.inputImport.click();
                            this.setState({importingWallet: true});
                            break;
                        case 'saveWallet':
                            this.inputExport.click();
                            this.setState({exportingWallet: true});
                            break;
                        case 'lock':
                            eventBus.emit('wallet_lock');
                            break;
                        case 'resetValidation':
                            wallet.resetTransactionValidationRejected();
                            wallet._doTransactionOutputRefresh().then(() => walletConsensus.doValidateTransaction());
                            break;
                        default:
                            props.history.push(selected);
                    }
                }}
            >
                <SideNav.Toggle/>
                <SideNav.Nav
                    defaultSelected={props.location.pathname.length === 0 ? '/wallet' : props.location.pathname}>
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavIcon>
                            <FontAwesomeIcon icon="home" size="1x"/>
                        </NavIcon>
                        <NavText>
                            home
                        </NavText>
                    </NavItem>
                    <NavItem key={'history'} eventKey="/history">
                        <NavIcon>
                            <FontAwesomeIcon icon="exchange-alt" size="1x"/>
                        </NavIcon>
                        <NavText>
                            transaction history
                        </NavText>
                    </NavItem>
                    <NavItem key={'log'} eventKey="/log">
                        <NavIcon>
                            <FontAwesomeIcon icon="stream" size="1x"/>
                        </NavIcon>
                        <NavText>
                            logs
                        </NavText>
                    </NavItem>
                    <NavItem key={'config'} eventKey="/config">
                        <NavIcon>
                            <FontAwesomeIcon icon="sliders-h" size="1x"/>
                        </NavIcon>
                        <NavText>
                            configure
                        </NavText>
                    </NavItem>
                    <NavItem key={'optimize'} eventKey="/optimize">
                        <NavIcon>
                            <FontAwesomeIcon icon="heartbeat" size="1x"/>
                        </NavIcon>
                        <NavText>
                            optimize
                        </NavText>
                    </NavItem>
                    <NavItem key={'resetValidation'} eventKey="resetValidation">
                        <NavIcon>
                            <FontAwesomeIcon icon="undo-alt" size="1x"/>
                        </NavIcon>
                        <NavText>
                            reset validation
                        </NavText>
                    </NavItem>
                    <NavItem key={'loadWallet'} eventKey="loadWallet">
                        <NavIcon>
                            <FontAwesomeIcon icon="wallet" size="1x"/>
                        </NavIcon>
                        <NavText>
                            load wallet
                        </NavText>
                    </NavItem>
                    <NavItem key={'saveWallet'} eventKey="saveWallet">
                        <NavIcon>
                            <FontAwesomeIcon icon="cloud-download-alt"
                                             size="1x"/>
                        </NavIcon>
                        <NavText>
                            save wallet
                        </NavText>
                    </NavItem>
                    <NavItem key={'lock'} eventKey="lock">
                        <NavIcon>
                            <FontAwesomeIcon icon="sign-out-alt" size="1x"/>
                        </NavIcon>
                        <NavText>
                            logout
                        </NavText>
                    </NavItem>
                </SideNav.Nav>
            </SideNav>
            <div>
                <input style={{display: 'none'}} type="file" accept=".json"
                       ref={(component) => this.inputImport = component}
                       onChange={this.importKey.bind(this)}
                       key={this.state.fileKeyImport}/>
                <input style={{display: 'none'}} type="file" accept=".json"
                       nwsaveas="millix_private_key.json"
                       ref={(component) => this.inputExport = component}
                       onChange={this.exportKeys.bind(this)}
                       key={this.state.fileKeyExport}/>
            </div>
        </div>);
    }
}


export default Sidebar;
