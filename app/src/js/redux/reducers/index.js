import {ADD_LOG_EVENT, ADD_NEW_ADDRESS, ADD_WALLET_CONFIG, CLEAR_TRANSACTION_DETAILS, LOCK_WALLET, SET_BACKLOG_SIZE, UNLOCK_WALLET, UPDATE_CLOCK, UPDATE_NETWORK_CONNECTIONS, UPDATE_NETWORK_NODE_LIST, UPDATE_NETWORK_STATE, UPDATE_TRANSACTION_DETAILS, UPDATE_WALLET_ADDRESS, UPDATE_WALLET_CONFIG, UPDATE_WALLET_MAINTENANCE, UPDATE_WALLET_TRANSACTIONS, WALLET_READY, UPDATE_WALLET_ADDRESS_VERSION, ADD_WALLET_ADDRESS_VERSION} from '../constants/action-types';
import config from '../../../../../deps/millix-node/core/config/config';
import _ from 'lodash';

const initialState = {
    network           : {
        node_list        : [],
        node_online_list : [],
        node_offline_list: [],
        connections      : 0,
        enabled          : true
    },
    wallet            : {
        id                  : undefined,
        unlocked            : false,
        isReady             : false,
        maintenance         : false,
        addresses           : [],
        transactions        : [],
        address_version_list: []
    },
    config            : {},
    clock             : 'not available...',
    log               : {
        events: [],
        size  : 0
    },
    backlog           : {
        size: 0
    },
    transactionDetails: null
};

function rootReducer(state = initialState, action) {
    if (action.type === UNLOCK_WALLET) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                unlocked           : true,
                id                 : action.payload,
                authenticationError: false
            }
        });
    }
    else if (action.type === LOCK_WALLET) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                ...action.payload,
                unlocked: false
            }
        });
    }
    else if (action.type === WALLET_READY) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                ...action.payload
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_STATE) {
        return Object.assign({}, state, {
            network: {
                ...state.network,
                enabled: action.payload
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_NODE_LIST) {
        let nodeListOnline = state.network.node_online_list.map(item => item.node);
        return Object.assign({}, state, {
            network: {
                ...state.network,
                connections      : state.network.node_online_list.length,
                node_list        : [...action.payload],
                node_offline_list: action.payload.filter(item => !nodeListOnline.includes(item.node))
            }
        });
    }
    else if (action.type === UPDATE_NETWORK_CONNECTIONS) {
        let nodeListOnline = action.payload.map(item => item.node);
        return Object.assign({}, state, {
            network: {
                ...state.network,
                connections      : action.payload.length,
                node_online_list : [...action.payload],
                node_offline_list: state.network.node_list.filter(item => !nodeListOnline.includes(item.node))
            }
        });
    }
    else if (action.type === UPDATE_WALLET_ADDRESS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                addresses: [...action.payload]
            }
        });
    }
    else if (action.type === ADD_NEW_ADDRESS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                addresses: [
                    ...state.wallet.addresses,
                    {
                        ...action.payload,
                        balance: 0
                    }
                ]
            }
        });
    }
    else if (action.type === UPDATE_WALLET_TRANSACTIONS) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                transactions: [...action.payload]
            }
        });
    }
    else if (action.type === UPDATE_WALLET_MAINTENANCE) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                maintenance: action.payload
            }
        });
    }
    else if (action.type === ADD_LOG_EVENT) {
        let excess = (state.log.events.length + action.payload.length) - config.WALLET_LOG_SIZE_MAX;
        if (excess > 0) {
            state.log.events.splice(state.log.events.length - excess);
        }

        return Object.assign({}, state, {
            log: {
                events: [
                    ...action.payload,
                    ...state.log.events
                ],
                size  : state.log.size + action.payload.length
            }
        });
    }
    else if (action.type === CLEAR_TRANSACTION_DETAILS) {
        return Object.assign({}, state, {
            transactionDetails: null
        });
    }
    else if (action.type === UPDATE_TRANSACTION_DETAILS) {
        return Object.assign({}, state, {
            transactionDetails: {...action.payload}
        });
    }
    else if (action.type === ADD_WALLET_CONFIG) {
        return Object.assign({}, state, {
            config    : {...state.config, ...action.payload.config},
            configType: {...state.configType, ...action.payload.type}
        });
    }
    else if (action.type === UPDATE_WALLET_CONFIG) {
        return Object.assign({}, state, {
            config: {...state.config, ...action.payload}
        });
    }
    else if (action.type === UPDATE_CLOCK) {
        return Object.assign({}, state, {
            clock: action.payload.clock
        });
    }
    else if (action.type === SET_BACKLOG_SIZE) {
        return Object.assign({}, state, {
            backlog: {size: action.payload}
        });
    }
    else if (action.type === UPDATE_WALLET_ADDRESS_VERSION) {
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                address_version_list: [...action.payload]
            }
        });
    }
    else if (action.type === ADD_WALLET_ADDRESS_VERSION) {
        if(action.payload.is_default === 1){
            _.each(state.wallet.address_version_list, version => version['is_default'] = 0);
        }
        return Object.assign({}, state, {
            wallet: {
                ...state.wallet,
                address_version_list: [
                    ...state.wallet.address_version_list,
                    action.payload
                ]
            }
        });
    }

    return state;
}

export default rootReducer;
