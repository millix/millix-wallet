import ntp from '../../deps/millix-node/core/ntp';
import React from 'react';
import ReactDOM from 'react-dom';
import store from './js/redux/store';
import {addWalletConfig, lockWallet, unlockWallet, updateClock, updateNetworkConnections, updateNetworkNodeList, updateWalletAddressVersion, walletReady, walletUpdateAddresses} from './js/redux/actions/index';
import AppContainer from './js/components/app-container';
import console from '../../deps/millix-node/core/console';
import network from '../../deps/millix-node/net/network';
import server from '../../deps/millix-node/api/server';
import database from '../../deps/millix-node/database/database';
import peer from '../../deps/millix-node/net/peer';
import eventBus from '../../deps/millix-node/core/event-bus';
import config from '../../deps/millix-node/core/config/config';
import configLoader from '../../deps/millix-node/core/config/config-loader';
import wallet, {WALLET_MODE} from '../../deps/millix-node/core/wallet/wallet';
import fs from 'fs';
import {config as faConfig, library} from '@fortawesome/fontawesome-svg-core';
import {faTrash, faArrowCircleLeft, faCloudDownloadAlt, faExchangeAlt, faFingerprint, faHeartbeat, faHome, faKey, faPlus, faSignOutAlt, faSlidersH, faStream, faUndoAlt, faWallet} from '@fortawesome/free-solid-svg-icons';
import '../node_modules/react-virtualized/styles.css';
import './css/bootstrap.min.css';
import '../node_modules/react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import '../node_modules/react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import '../node_modules/@fortawesome/fontawesome-svg-core/styles.css';
import '../node_modules/@trendmicro/react-sidenav/dist/react-sidenav.css';
import './css/app.scss';
import moment from 'moment';
import logManager from './js/core/log-manager';
import mutex from '../../deps/millix-node/core/mutex';
import yargs from 'yargs';
import jobEngine from '../../deps/millix-node/job/job-engine';

faConfig.autoAddCss = false;
library.add(faArrowCircleLeft, faWallet, faKey, faHome, faFingerprint,
    faStream, faExchangeAlt, faCloudDownloadAlt, faSlidersH,
    faSignOutAlt, faPlus, faHeartbeat, faUndoAlt, faTrash);

const argv = yargs
    .options({
        'initial-peers': {
            demandOption: false,
            array       : true
        }
    }).parse(nw.App.argv);

//nw.Window.get().showDevTools()

if (argv.initialPeers) {
    config.NODE_INITIAL_LIST = argv.initialPeers;
}
if (argv.port) {
    config.NODE_PORT = argv.port;
}
if (argv.folder) {
    config.KEY_PATH                   = argv.folder + 'keys.json';
    config.DATABASE_CONNECTION.FOLDER = argv.folder;
}

if (config.MODE_DEBUG) {
    const path = './';

    const reloadWatcher = fs.watch(path, function() {
        // Log that we're reloading the app
        console.log('Reloading app...');
        // Clear and delete node-webkit's global required modules cache.
        // See: http://stackoverflow.com/q/25143532/
        for (let i = 0; i < global.require.cache.length; i++) {
            delete global.require.cache[i];
        }

        location.reload();
        reloadWatcher.close();
    });
}

process.on('SIGINT', function() {
    console.log('\nGracefully shutting down from  SIGINT (Crtl-C)');
    return database.close();
});

process.on('exit', function() {
    return database.close();
});

console.log('starting millix-core');

let initializeWallet = () => {
    wallet.setMode(WALLET_MODE.APP).initialize()
          .then(() => network.initialize())
          .then(() => server.initialize())
          .then(() => peer.initialize())
          .then(() => jobEngine.initialize())
          .then(() => eventBus.emit('node_list_update'))
          .catch(e => {
              console.log(e);
          });
};

setInterval(() => {
    if (!ntp.initialized || !store.getState().wallet.unlocked) {
        return;
    }

    let clock = new Date();
    clock.setUTCMilliseconds(clock.getUTCMilliseconds() + ntp.offset);
    store.dispatch(updateClock(moment.utc(clock).format('YYYY-MM-DD HH:mm:ss')));
}, 900);
eventBus.on('wallet_ready', (ready) => store.dispatch(walletReady({
    isReady: true,
    isNew  : ready.create
})));
eventBus.on('wallet_unlock', wallet => {
    logManager.start();
    store.dispatch(unlockWallet(wallet));
});
eventBus.on('node_list', () => store.dispatch(updateNetworkNodeList()));
eventBus.on('node_list_update', () => store.dispatch(updateNetworkNodeList()));
eventBus.on('node_status_update', () => store.dispatch(updateNetworkConnections(network.registeredClients)));
eventBus.on('wallet_update', (walletID) => store.dispatch(walletUpdateAddresses(walletID)));
eventBus.on('wallet_update_address_version', (addressVersionList) => store.dispatch(updateWalletAddressVersion(addressVersionList)));
eventBus.on('node_event_log', data => {
    logManager.addLog(data);
    logManager.setBacklogSize(mutex.getKeyQueuedSize(['transaction']));
});
eventBus.on('wallet_event_log', data => {
    logManager.addLog(data);
    logManager.setBacklogSize(mutex.getKeyQueuedSize(['transaction']));
});
eventBus.on('wallet_reload', (readyCallback) => {
    eventBus.removeAllListeners('wallet_key');
    readyCallback && eventBus.once('wallet_ready', readyCallback);
    initializeWallet();
});
eventBus.on('wallet_lock', (lockPayload) => {
    store.dispatch(lockWallet(lockPayload));
    wallet.stopTasks();
    network.stopTasks();
    peer.stopTasks();
    logManager.stop();
    eventBus.emit('wallet_reload');
});

eventBus.on('wallet_authentication_error', () => {
    store.dispatch(walletReady({authenticationError: true}));
    initializeWallet();
});
eventBus.emit('wallet_event_log', {
    type   : 'boot',
    content: 'application started'
});

database.initialize()
        .then(() => eventBus.emit('wallet_update_address_version', database.getRepository('address').addressVersionList))
        .then(() => configLoader.load().then(config => store.dispatch(addWalletConfig(config))))
        .then(() => initializeWallet());

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(< AppContainer store={store}
/>, wrapper) : false;
