import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';
import Wallet from './wallet';
import UnlockWallet from './unlock-wallet';
import UnlockedWalletRequiredRoute from './utils/unlocked-wallet-required-route';
import TransactionDetails from './transaction-details';
import TransactionHistoryView from './transaction-history-view';
import WalletMaintenanceView from './wallet-maintenance-view';
import EventLogView from './event-log-view';
import ConfigView from './config-view';
import PeerListView from './peer-list-view';
import PeerInfoView from './peer-info-view';
import NewWallet from './new-wallet';

const AppContainer = ({store}) => (
    <Provider store={store}>
        <Router>
            <Switch>
                <Route path='/unlock/' component={UnlockWallet}/>
                <Route path='/newWallet/' component={NewWallet}/>
                <UnlockedWalletRequiredRoute path='/config'
                                             component={ConfigView}/>
                <UnlockedWalletRequiredRoute path='/optimize'
                                             component={WalletMaintenanceView}/>
                <UnlockedWalletRequiredRoute path='/transaction/:transaction_id'
                                             component={TransactionDetails}/>
                <UnlockedWalletRequiredRoute path='/history'
                                             component={TransactionHistoryView}/>
                <UnlockedWalletRequiredRoute path='/log'
                                             component={EventLogView}/>
                <UnlockedWalletRequiredRoute path='/peers'
                                             component={PeerListView}/>
                <UnlockedWalletRequiredRoute path='/peer/:peer'
                                             component={PeerInfoView}/>
                <UnlockedWalletRequiredRoute component={Wallet}/>
            </Switch>
        </Router>
    </Provider>
);

AppContainer.propTypes = {
    store: PropTypes.object.isRequired
};

export default AppContainer;
