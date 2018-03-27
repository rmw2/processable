/**
 * Commands that the console should respond to
 * @param {React.Component} view -- the top-level component which will
 * respond to the commands
 *
 * @this should be the process object being monitored by the component
 */
export default function commands(view) {
  // Get executable name excluding .s
  const name = view.props.filename.slice(0,-2);

  const cmd = {
    run: (argv) => {
      argv.unshift(name);
      this.exec(argv);
      view.forceUpdate();

      return `Starting program: ${argv.join(' ')}\n  in _start() @0x${this.pc.toString(16)}`;
    },
    break: (addrOrLabel) => {
      let isSet = this.toggleBreakpoint(addrOrLabel);
      view.forceUpdate();

      return `${isSet ? 'Set' : 'Cleared'} breakpoint at @${addrOrLabel.toString(16)}`;
    },
    step: () => {
      view.step();
    },
    continue: () => {
      view.run();
    },
    restart: () => {
      view.props.restart();
      view.forceUpdate();
    },
    help: (args) => {
      let command = args[0];
      // First map aliases to commands
      // TODO

      return (command)
        ? (command in help ? help[command] : `Unknown command: ${command}`)
        : Object.keys(help).map((k) => help[k]).reduce((str, curr) => `${str}\n${curr}`);
    }
  };

  // Setup aliases
  cmd.si = cmd.step;
  cmd.c = cmd.continue;
  cmd.b = cmd.break;

  return cmd;
};

const help = {
  run: 'run [<arg1> <arg2> ...]\n  Begin or restart the process with the provided argv array',
  break: 'break <address|label>\n  Toggle a breakpoint at the provided address or label',
  step: 'step\n  Execute the next instruction, ',
  continue: 'continue\n  Continue execution until the next breakpoint or console I/O',
  help: 'help [<command>]\n  Display this message, or the help text for a specific command'
};