let millixNodeProcess;
process.on('exit', function() {
    console.log('killing node process: ', millixNodeProcess.pid);
    if (millixNodeProcess) {
        try {
            millixNodeProcess.kill();
        }
        catch (ignore) {
        }
    }
});

process.on('SIGINT', () => process.exit()); // catch ctrl-c
process.on('SIGTERM', () => process.exit()); // catch kill

millixNodeProcess = require('child_process').fork('./index.dist.js', {
    env: {
        ...process.env,
        'NODE_OPTIONS': '--openssl-legacy-provider'
    }
});

millixNodeProcess.on('message', data => window.postMessage(data));

console.log('millix node fork process id:', millixNodeProcess.pid);

