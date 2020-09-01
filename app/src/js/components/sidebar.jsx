import React, {Component} from 'react';
import SideNav, {NavItem, NavText} from '@trendmicro/react-sidenav';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import eventBus from '../../../../deps/millix-node/core/event-bus';
import walletUtils from '../../../../deps/millix-node/core/wallet/wallet-utils';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import database from '../../../../deps/millix-node/database/database';
import fs from 'fs';
import async from 'async';


class Sidebar extends Component {
    constructor(props) {
        super(props);
        let now            = Date.now();
        this.walletScreens = [
            '/history',
            '/log',
            '/config',
            '/transaction',
            '/peer'
        ];
        this.state         = {
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

    isWalletScreen(pathName) {
        if (!pathName) {
            return false;
        }

        for (let screen of this.walletScreens) {
            if (pathName.startsWith(screen)) {
                return true;
            }
        }
        return false;
    }

    render() {
        let props = this.props;
        return (<aside className={'navigation'}>
            <SideNav
                expanded={true}
                style={{minWidth: 200}}
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
                            wallet._doTransactionOutputRefresh().then(_ => _);
                            break;
                        default:
                            props.history.push(selected);
                    }
                }}
            >
                <SideNav.Nav
                    defaultSelected={!this.isWalletScreen(props.location.pathname) ? '/wallet' : props.location.pathname}>
                    <li className="nav-category">
                        {this.props.clock}
                    </li>
                    <NavItem key={'wallet'} eventKey="/wallet">
                        <NavText>
                            home
                        </NavText>
                    </NavItem>
                    <NavItem key={'history'} eventKey="/history">
                        <NavText>
                            transaction history
                        </NavText>
                    </NavItem>
                    <NavItem key={'log'} eventKey="/log">
                        <NavText>
                            logs
                        </NavText>
                    </NavItem>
                    <NavItem key={'config'} eventKey="/config">
                        <NavText>
                            configure
                        </NavText>
                    </NavItem>
                    <NavItem key={'optimize'} eventKey="/optimize">
                        <NavText>
                            optimize
                        </NavText>
                    </NavItem>
                    <NavItem key={'resetValidation'} eventKey="resetValidation">
                        <NavText>
                            reset validation
                        </NavText>
                    </NavItem>
                    <NavItem key={'loadWallet'} eventKey="loadWallet">
                        <NavText>
                            load wallet
                        </NavText>
                    </NavItem>
                    <NavItem key={'saveWallet'} eventKey="saveWallet">
                        <NavText>
                            save wallet
                        </NavText>
                    </NavItem>
                    <NavItem key={'lock'} eventKey="lock">
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
        </aside>);
    }
}


export default Sidebar;
