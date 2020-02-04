import React, {Component} from 'react';
import {Row, Spinner} from 'react-bootstrap';
import network from '../../../../deps/millix-node/net/network';
import peer from '../../../../deps/millix-node/net/peer';
import store from '../redux/store';
import {updateWalletMaintenance} from '../redux/actions';
import logManager from '../core/log-manager';
import wallet from '../../../../deps/millix-node/core/wallet/wallet';
import database from '../../../../deps/millix-node/database/database';


class WalletMaintenanceView extends Component {
    constructor(props) {
        super(props);
    }

    optimizeWallet() {
        wallet.stopTasks();
        network.stopTasks();
        peer.stopTasks();
        logManager.stop();
        store.dispatch(updateWalletMaintenance(true));
        database.runVacuum()
                .then(() => database.runWallCheckpoint())
                .then(() => {
                    store.dispatch(updateWalletMaintenance(false));
                    logManager.start();
                    wallet.initialize(true)
                          .then(() => network.initialize())
                          .then(() => peer.initialize())
                          .then(() => {
                              this.props.history.goBack();
                          });
                });
    }

    componentWillMount() {
        this.optimizeWallet();
    }

    render() {
        return (
            <Row className="mb-3" style={{
                height        : 'calc(100% - 130px)',
                justifyContent: 'center'
            }}>
                <div style={{
                    alignSelf: 'center',
                    marginTop: -100
                }}>
                        <span>optimizing the health of your wallet...  <Spinner
                            as="span"
                            animation="border"
                            size="lg"
                            role="status"
                            aria-hidden="true"
                        /></span>
                </div>
            </Row>
        );
    }
}


export default WalletMaintenanceView;
