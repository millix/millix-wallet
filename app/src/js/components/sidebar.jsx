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
        return (<aside className={'navigation'} style={{height: '100%', minHeight: '100vh'}}>
            <SideNav
                expanded={true}
                style={{minWidth: 200}}
                onSelect={(selected) => {
                    switch (selected) {
                        case 'lock':
                            eventBus.emit('wallet_lock');
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
                    <NavItem key={'connections'} eventKey="/peers">
                        <NavText>
                            connections
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
                    <NavItem key={'actions'} eventKey="/actions">
                        <NavText>
                            actions
                        </NavText>
                    </NavItem>
                    <NavItem key={'lock'} eventKey="lock">
                        <NavText>
                            logout
                        </NavText>
                    </NavItem>
                </SideNav.Nav>
            </SideNav>
        </aside>);
    }
}


export default Sidebar;
