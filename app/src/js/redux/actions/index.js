import {UPDATE_WALLET_ADDRESS_VERSION, ADD_LOG_EVENT, ADD_NEW_ADDRESS, ADD_WALLET_CONFIG, CLEAR_TRANSACTION_DETAILS, LOCK_WALLET, SET_BACKLOG_SIZE, UNLOCK_WALLET, UPDATE_CLOCK, UPDATE_NETWORK_CONNECTIONS, UPDATE_NETWORK_NODE_LIST, UPDATE_NETWORK_STATE, UPDATE_TRANSACTION_DETAILS, UPDATE_WALLET_ADDRESS, UPDATE_WALLET_CONFIG, UPDATE_WALLET_MAINTENANCE, UPDATE_WALLET_TRANSACTIONS, WALLET_READY, ADD_WALLET_ADDRESS_VERSION} from '../constants/action-types';
import database from '../../../../../deps/millix-node/database/database';
import wallet from '../../../../../deps/millix-node/core/wallet/wallet';
import async from 'async';
import _ from 'lodash';
import network from '../../../../../deps/millix-node/net/network';

export function walletUpdateTransactions() {
    return (dispatch) => wallet.getAllTransactions()
                               .then(payload => dispatch({
                                   type: UPDATE_WALLET_TRANSACTIONS,
                                   payload
                               }));
}

export function updateWalletAddressVersion(payload) {
    return {
        type: UPDATE_WALLET_ADDRESS_VERSION,
        payload
    };
}

export function removeWalletAddressVersion(payload) {
    return (dispatch) => {
        database.getRepository('address')
                .removeAddressVersion(payload.version)
                .then(() => {
                    dispatch({
                        type   : UPDATE_WALLET_ADDRESS_VERSION,
                        payload: database.getRepository('address').addressVersionList
                    });
                })
                .catch(() => {
                });
    };

}

export function addWalletAddressVersion(payload) {
    return (dispatch) => {
        database.getRepository('address')
                .addAddressVersion(payload.version, payload.is_main_network, payload.regex_pattern, payload.is_default)
                .then(() => {
                    dispatch({
                        type: ADD_WALLET_ADDRESS_VERSION,
                        payload
                    });
                })
                .catch(() => {
                });
    };
}

export function unlockWallet(payload) {
    return {
        type: UNLOCK_WALLET,
        payload
    };
}

export function lockWallet(payload) {
    return {
        type   : LOCK_WALLET,
        payload: payload || {
            isNew         : false,
            isImportWallet: false
        }
    };
}

export function addWalletConfig(payload) {
    return {
        type: ADD_WALLET_CONFIG,
        payload
    };
}

export function walletUpdateConfig(payload) {
    return (dispatch) => {
        return new Promise(resolve => {
            async.each(_.keys(payload), (key, callback) => {
                database.getRepository('config')
                        .updateConfig(key, payload[key])
                        .then(() => callback());
            }, () => {
                dispatch({
                    type: UPDATE_WALLET_CONFIG,
                    payload
                });
                resolve();
            });
        });
    };
}

export function clearTransactionDetails() {
    return {type: CLEAR_TRANSACTION_DETAILS};
}

export function updateTransactionDetails(transactionID) {
    return (dispatch) => {
        const transactionRepository = database.getRepository('transaction');
        return transactionRepository.getTransactionObject(transactionID)
                                    .then(payload => dispatch({
                                        type   : UPDATE_TRANSACTION_DETAILS,
                                        payload: transactionRepository.normalizeTransactionObject(payload)
                                    }));
    };
}

export function walletReady(payload) {
    console.log('wallet ready', payload);
    return {
        type: WALLET_READY,
        payload
    };
}

export function setBackLogSize(payload) {
    return {
        type: SET_BACKLOG_SIZE,
        payload
    };
}

export function addLogEvent(payload) {
    return {
        type: ADD_LOG_EVENT,
        payload
    };
}

export function updateNetworkState(payload) {
    if (payload) {
        network.initialize();
    }
    else {
        network.stop();
    }

    return {
        type: UPDATE_NETWORK_STATE,
        payload
    };
}

export function updateNetworkConnections(payload) {
    return {
        type: UPDATE_NETWORK_CONNECTIONS,
        payload
    };
}

export function updateWalletMaintenance(payload) {
    return {
        type: UPDATE_WALLET_MAINTENANCE,
        payload
    };
}

export function updateNetworkNodeList() {
    return (dispatch) => database.getRepository('node')
                                 .getNodes()
                                 .then(items => items.map(item => {
                                     return {node: item.node_prefix + item.node_ip_address + ':' + item.node_port};
                                 }))
                                 .then(payload => dispatch({
                                     type: UPDATE_NETWORK_NODE_LIST,
                                     payload
                                 }));
}


export function walletUpdateAddresses(walletID) {
    return (dispatch) => database.getRepository('keychain')
                                 .getWalletAddresses(walletID)
                                 .then(addresses => {
                                     return new Promise(resolve => {
                                         async.eachSeries(addresses, (item, callback) => {
                                             database.getRepository('address')
                                                     .getAddressBalance(item.address, true)
                                                     .then(balance => {
                                                         item['balance'] = balance || 0;
                                                     }).then(() => {
                                                 database.getRepository('address')
                                                         .getAddressBalance(item.address, false)
                                                         .then(balance => {
                                                             item['pendingBalance'] = balance || 0;
                                                             callback();
                                                         });
                                             });
                                         }, () => resolve(addresses));
                                     });
                                 })
                                 .then(payload => dispatch({
                                     type: UPDATE_WALLET_ADDRESS,
                                     payload
                                 }));
}

export function addNewAddress(walletID) {
    return (dispatch) => wallet.addNewAddress(walletID).then(payload => dispatch({
        type: ADD_NEW_ADDRESS,
        payload
    }));
}

export function updateClock(clock) {
    return {
        type   : UPDATE_CLOCK,
        payload: {clock}
    };
}
