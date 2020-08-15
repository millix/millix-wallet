import {UPDATE_WALLET_ADDRESS_VERSION, ADD_LOG_EVENT, ADD_NEW_ADDRESS, ADD_WALLET_CONFIG, CLEAR_TRANSACTION_DETAILS, LOCK_WALLET, SET_BACKLOG_SIZE, UNLOCK_WALLET, UPDATE_CLOCK, UPDATE_NETWORK_CONNECTIONS, UPDATE_NETWORK_NODE_LIST, UPDATE_NETWORK_STATE, UPDATE_TRANSACTION_DETAILS, UPDATE_WALLET_ADDRESS, UPDATE_WALLET_CONFIG, UPDATE_WALLET_MAINTENANCE, UPDATE_WALLET_TRANSACTIONS, WALLET_READY, ADD_WALLET_ADDRESS_VERSION, GET_NODE_ATTRIBUTES, UPDATE_WALLET_BALANCE} from '../constants/action-types';
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
    return (dispatch) => {
        database.getRepository('keychain')
                .getWalletDefaultKeyIdentifier(payload)//walletID
                .then(defaultKeyIdentifier => {
                    dispatch({
                        type   : UNLOCK_WALLET,
                        payload: {
                            address_key_identifier: defaultKeyIdentifier,
                            id                    : payload
                        }
                    });
                });
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
        database.firstShards((shardID) => {
            return new Promise((resolve, reject) => {
                const transactionRepository = database.getRepository('transaction', shardID);
                return transactionRepository.getTransactionObject(transactionID)
                                            .then(transaction => transaction ? resolve(transaction) : reject());
            });
        }).then(payload => dispatch({
            type   : UPDATE_TRANSACTION_DETAILS,
            payload: database.getRepository('transaction').normalizeTransactionObject(payload)
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
                                 .listNodes()
                                 .then(items => items.map(item => {
                                     return {node: item.node_prefix + item.node_ip_address + ':' + item.node_port};
                                 }))
                                 .then(payload => dispatch({
                                     type: UPDATE_NETWORK_NODE_LIST,
                                     payload
                                 }));
}

export function walletUpdateBalance(keyIdentifier) {
    return (dispatch) => {
        database.applyShards((shardID) => {
            const transactionRepository = database.getRepository('transaction', shardID);
            return transactionRepository.getWalletBalance(keyIdentifier, true);
        }).then(balanceList => _.sum(balanceList)).then(balance => {
            let payload = {};
            payload['balance_stable'] = balance || 0;
            return payload;
        }).then((payload) => {
            return database.applyShards((shardID) => {
                const transactionRepository = database.getRepository('transaction', shardID);
                return transactionRepository.getWalletBalance(keyIdentifier, false);
            }).then(balanceList => _.sum(balanceList)).then(balance => {
                payload['balance_pending'] = balance || 0;
                return payload;
            });
        }).then(payload => dispatch({
            type: UPDATE_WALLET_BALANCE,
            payload
        }));
    };
}

export function walletUpdateAddresses(walletID) {
    return (dispatch) => database.getRepository('keychain')
                                 .getWalletAddresses(walletID)
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

export function getNodeAttribute(nodeID) {//removeWalletAddressVersion(payload) {
    return (dispatch) => {
        //nodeRepository.listNodeAttribute(where: {node_id:nodeID}, orderBy,
        // limit);
        return database.getRepository('node')
                       .listNodeAttribute({node_id: nodeID})
                       .then((listAttributes) => {
                           return dispatch({
                               type   : GET_NODE_ATTRIBUTES,
                               payload: listAttributes
                           });
                       })
                       .catch(() => {
                       });
    };

}
