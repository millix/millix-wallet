import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Provider} from 'react-redux';
import PropTypes from 'prop-types';
import Wallet from './wallet';
import UnlockWallet from './unlock-wallet';
import UnlockedWalletRequiredRoute from './utils/unlocked-wallet-required-route';
import TransactionDetails from './transaction-details';
import TransactionHistoryView from './transaction-history-view';
import EventLogView from './event-log-view';
import ConfigView from './config-view';
import PeerListView from './peer-list-view';
import PeerInfoView from './peer-info-view';
import NewWallet from './new-wallet';
import ActionView from './action-view';


class AppContainer extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        let scroll = $('body').getNiceScroll();
        if (scroll.length === 0) {
            scroll = $('body').niceScroll();
        }
        else {
            scroll.resize();
        }
        setInterval(() => scroll.resize(), 500);
    }

    render() {
        return <Provider store={this.props.store}>
            <Router>
                <Switch>
                    <Route path='/unlock/' component={UnlockWallet}/>
                    <Route path='/newWallet/' component={NewWallet}/>
                    <UnlockedWalletRequiredRoute path='/config'
                                                 component={ConfigView}/>
                    <UnlockedWalletRequiredRoute
                        path='/transaction/:transaction_id'
                        component={TransactionDetails}/>
                    <UnlockedWalletRequiredRoute path='/history'
                                                 component={TransactionHistoryView}/>
                    <UnlockedWalletRequiredRoute path='/log'
                                                 component={EventLogView}/>
                    <UnlockedWalletRequiredRoute path='/peers'
                                                 component={PeerListView}/>
                    <UnlockedWalletRequiredRoute path='/peer/:peer'
                                                 component={PeerInfoView}/>
                    <UnlockedWalletRequiredRoute path='/actions'
                                                 component={ActionView}/>
                    <UnlockedWalletRequiredRoute component={Wallet}/>
                </Switch>
            </Router>
        </Provider>;
    }
}


AppContainer.propTypes = {
    store: PropTypes.object.isRequired
};

export default AppContainer;
