import ntp from '../../deps/millix-node/core/ntp';
import React from 'react';
import ReactDOM from 'react-dom';
import store from './js/redux/store';
import _ from 'lodash';
import {addWalletConfig, lockWallet, unlockWallet, updateClock, updateNetworkConnections, updateNetworkNodeList, updateWalletAddressVersion, walletReady, walletUpdateAddresses, walletUpdateBalance} from './js/redux/actions/index';
import AppContainer from './js/components/app-container';
import console from '../../deps/millix-node/core/console';
import network from '../../deps/millix-node/net/network';
import database from '../../deps/millix-node/database/database';
import eventBus from '../../deps/millix-node/core/event-bus';
import config from '../../deps/millix-node/core/config/config';
import configLoader from '../../deps/millix-node/core/config/config-loader';
import {WALLET_MODE} from '../../deps/millix-node/core/wallet/wallet';
import services from '../../deps/millix-node/core/services/services';
import bootstrap from '../../deps/millix-node/core/bootstrap';
import fs from 'fs';
import {config as faConfig, library} from '@fortawesome/fontawesome-svg-core';
import {faArrowCircleLeft, faCloudDownloadAlt, faExchangeAlt, faFingerprint, faHeartbeat, faHome, faKey, faPlus, faSignOutAlt, faSlidersH, faStream, faTrash, faUndoAlt, faWallet} from '@fortawesome/free-solid-svg-icons';
//import '../node_modules/react-virtualized/styles.css';
//import '../node_modules/react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
//import '../node_modules/react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css';
import '../node_modules/@trendmicro/react-sidenav/dist/react-sidenav.css';
import '../node_modules/@fortawesome/fontawesome-svg-core/styles.css';
import './css/app.scss';
import './vendor/luna/luna';
import moment from 'moment';
import logManager from '../../deps/millix-node/core/log-manager';
import yargs from 'yargs';
import {addLogEvent, setBackLogSize} from './js/redux/actions';

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
    config.WALLET_KEY_PATH            = argv.folder + 'millix_private_key.json';
    config.NODE_KEY_PATH              = argv.folder + 'node.json';
    config.NODE_CERTIFICATE_KEY_PATH  = argv.folder + 'node_certificate_key.pem';
    config.NODE_CERTIFICATE_PATH      = argv.folder + 'node_certificate.pem';
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
    services.stop();
    services.initialize({mode: WALLET_MODE.APP})
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
    logManager.setOnUpdate(() => {
        store.dispatch(addLogEvent(logManager.logsCache));
        store.dispatch(setBackLogSize(logManager.backLogSize));
    });
    store.dispatch(unlockWallet(wallet));
});
eventBus.on('node_list', () => store.dispatch(updateNetworkNodeList()));
eventBus.on('node_list_update', () => store.dispatch(updateNetworkNodeList()));
eventBus.on('node_status_update', () => store.dispatch(updateNetworkConnections(_.filter(network.registeredClients, ws => ws.nodeConnectionReady))));
eventBus.on('wallet_update', () => {
    const wallet = store.getState().wallet;
    store.dispatch(walletUpdateAddresses(wallet.id));
    store.dispatch(walletUpdateBalance(wallet.address_key_identifier));
});
eventBus.on('wallet_update_address_version', (addressVersionList) => store.dispatch(updateWalletAddressVersion(addressVersionList)));
eventBus.on('wallet_reload', (readyCallback) => {
    eventBus.removeAllListeners('wallet_key');
    readyCallback && eventBus.once('wallet_ready', readyCallback);
    initializeWallet();
});
eventBus.on('wallet_lock', (lockPayload) => {
    store.dispatch(lockWallet(lockPayload));
    services.stop();
    eventBus.emit('wallet_reload');
});

eventBus.on('wallet_authentication_error', () => {
    store.dispatch(walletReady({authenticationError: true}));
    services.stop();
    initializeWallet();
});
eventBus.emit('wallet_event_log', {
    type   : 'boot',
    content: 'application started'
});

bootstrap.initialize()
         .then(() => database.initialize())
         .then(() => eventBus.emit('wallet_update_address_version', database.getRepository('address').addressVersionList))
         .then(() => configLoader.load().then(config => store.dispatch(addWalletConfig(config))))
         .then(() => initializeWallet());

const wrapper = document.getElementById('app');
wrapper ? ReactDOM.render(< AppContainer store={store}
/>, wrapper) : false;
