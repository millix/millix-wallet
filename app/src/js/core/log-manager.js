import store from '../redux/store';
import {addLogEvent, setBackLogSize} from '../redux/actions/index';
import task from '../../../../deps/millix-node/core/task';


class LogManager {
    constructor(updateFrequency) {
        this.logsCache       = [];
        this.backLogSize     = 0;
        this.started         = false;
        this.updateFrequency = updateFrequency;
    }

    _update() {
        store.dispatch(addLogEvent(this.logsCache));
        store.dispatch(setBackLogSize(this.backLogSize));
        this.logsCache = [];
    }

    start() {
        if (this.started) {
            return;
        }
        task.scheduleTask('update log', this._update.bind(this), this.updateFrequency);
        this.started = true;
    }

    stop() {
        task.removeTask('update log');
        this.started     = false;
        this.logsCache   = [];
        this.backLogSize = 0;
    }

    setBacklogSize(size) {
        this.backLogSize = size;
    }

    addLog(data) {
        if (!this.started) {
            return;
        }
        this.logsCache.push({
            ...data,
            content  : JSON.stringify(data.content || '', null, '\t'),
            type     : data.type.split(':')[0],
            timestamp: store.getState().clock
        });
    }
}


export default new LogManager(250);
