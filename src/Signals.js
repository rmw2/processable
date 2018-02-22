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

export default class Signals {
    constructor(signals=SIGNALS) {
        this.signals = {};
        for (const name of signals)
            this.signals[name] = () => null;
    }

    register(name, callback) {
        this.signals[name] = callback;
    }

    unregsiter(name) {
        this.signals[name] = () => null;
    }

    dispatch(signal, args) {
        // Call that signal handler yo
        this.signals[signal](args);
    }
}