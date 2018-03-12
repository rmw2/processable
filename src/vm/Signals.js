/**
 * Signal handling and stuff.  Using
 */

const SIGNALS = [
    'SIGSEGV',
    'SIGIO',
    'SIGQUIT',
    'SIGTERM',
    'SIGKILL',
    'SIGALRM'
];

/**
 * Signal-Callback abstraction with at most one handler installed
 * per signal
 */
export default class Signals {
    constructor(signals=SIGNALS) {
        this.signals = {};
        for (const name of signals)
            this.signals[name] = () => null;
    }

    register(name, callback) {
        this.signals[name] = callback;
    }

    unregister(name) {
        this.signals[name] = () => null;
    }

    dispatch(signal, ...args) {
        if (signal in this.signals)
            this.signals[signal](...args);
    }
}

/**
 * Event-Callbacks abstraction with potentially multiple callbacks registered
 * per event
 */
export class Events {
    constructor() {
        this.events = {};
    }

    register(name, callback) {
        if (!(name in this.events))
            this.events[name] = [];

        this.events[name].push(callback);
    }

    unregister(name, callback) {
        if (!(name in this.events))
            return;

        for (const i in this.events[name])
            if (this.events[name][i] === callback)
                this.events[name].splice(i, 1);
    }

    dispatch(name, args) {
        if (!(name in this.events))
            return;

        for (const i in this.events[name])
            this.events[name](...args);
    }
}