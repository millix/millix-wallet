import console from '../deps/millix-node/core/console';
import logger from '../deps/millix-node/core/logger';
import db from '../deps/millix-node/database/database';
import config from '../deps/millix-node/core/config/config';
import configLoader from '../deps/millix-node/core/config/config-loader';
import services from '../deps/millix-node/core/services/services';
import logManager from '../deps/millix-node/core/log-manager';
import eventBus from '../deps/millix-node/core/event-bus';
import fs from 'fs';
import path from 'path';
import os from 'os';

console.log('[millix-node]', process.cwd());

const dataFolder                             = path.join(os.homedir(), config.DATABASE_CONNECTION.FOLDER);
config.STORAGE_CONNECTION.FOLDER             = path.join(dataFolder, '/storage/');
config.STORAGE_CONNECTION.PENDING_TO_SEND    = path.join(dataFolder, '/storage/sending.log');
config.STORAGE_CONNECTION.PENDING_TO_RECEIVE = path.join(dataFolder, '/storage/receiving.log');
config.WALLET_KEY_PATH                       = path.join(dataFolder, 'millix_private_key.json');
config.NODE_KEY_PATH                         = path.join(dataFolder, 'node.json');
config.NODE_CERTIFICATE_KEY_PATH             = path.join(dataFolder, 'node_certificate_key.pem');
config.NODE_CERTIFICATE_PATH                 = path.join(dataFolder, 'node_certificate.pem');
config.JOB_CONFIG_PATH                       = path.join(dataFolder, 'job.json');
config.DATABASE_CONNECTION.FOLDER            = dataFolder;

console.log('[millix-node]', dataFolder);

const pidFile = path.join(dataFolder, 'millix-node.pid');

process.title = 'millix-wallet';

let shutdown = false;
process.on('SIGINT', async function() {
    if (!shutdown) {
        shutdown = true;
        console.log('\n[main] gracefully shutting down from SIGINT (Crtl-C)');
        console.log('[main] closing all db connections');
        await db.close();
        console.log('[main] all db connections closed');

        if (pidFile && fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
        }

        process.exit(0);
    }
});

const checkPIDFile = () => {
    if (!pidFile) {
        console.log('pid file not in use');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        if (!fs.existsSync(pidFile)) {
            fs.writeFile(pidFile, '' + process.pid, () => {
                resolve();
            });
            return;
        }

        fs.readFile(pidFile, 'utf-8', (err, data) => {
            let pid           = parseInt(data);
            let processKilled = false;
            if (Number.isInteger(pid)) {
                try {
                    process.kill(pid);
                }
                catch (ignore) {
                }
                processKilled = true;
                console.log('zombie process killed, pid:', pid);
            }
            fs.writeFile(pidFile, '' + process.pid, () => {
                setTimeout(() => resolve(), processKilled ? 1000 : 0);
            });
        });
    });
};

eventBus.on('node_data', data => {
    process.send({
        type: 'update_api',
        ...data
    });
});

logger.initialize().then(() => {
    console.log('starting millix-core');
    checkPIDFile()
        .then(() => db.initialize())
        .then(() => configLoader.load())
        .then(() => services.initialize({auto_create_wallet: false}))
        .then(() => logManager.logSize = 1000);
});
