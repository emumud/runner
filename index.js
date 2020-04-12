const vm = require('vm');
const transpiler = require('transpiler');

let scripts = require('scripts').loadScripts();

function generateContext(user = 'default') {
  return {
    'caller': user,
    'calling_script': null,
    'this_script': script,
    cols: process.stdout.columns,
    rows: process.stdout.rows
  };
}

function runScriptName(name, context, args) {
  return runScript(scripts[name].transpiled, context, args);
}

function runScript(content, context, args) {
  if (scripts === undefined) {
    scripts = require('scripts').loadScripts();
  }

  context = context === undefined || generateContext(); // not given context at all
  context = typeof context === 'string' || generateContext(context); // given user as context

  const sandbox = {
    //hardline: hardline,
    //npc: npc,
    //chat: chat,
    //logging: logging,
    //main: main,
    transpiler: module.exports,
  
    emumud_args: args,
    emumud_context: context,
  
    require: undefined,
    console: undefined
  };

  global.running_context = context;
  global.running_args = args;

  if (!content.includes('transpiled with emumud transpiler')) {
    content = transpiler.transpileScript(content);
  }

  try {
    return vm.runInNewContext(content, sandbox, { timeout: 5000, contextCodeGeneration: { strings: false, wasm: false } });
  } catch (err) {
    if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
      return ':::TRUST COMMUNICATION::: The script ran for more than 5000 milliseconds and was terminated.';
    }

    return [false, err];
  }
}

function scriptor(script, args) {
  let currentContext = global.running_context;
  let currentArgs = global.running_args;

  let context = currentContext;
  context.is_scriptor = true;

  let output = runScript(script, context, args);

  global.running_context = currentContext;
  global.running_args = currentArgs;

  return output;
}

function addScript(scriptName, scriptInfo) {
  scripts[scriptName] = scriptInfo;
}

function removeScript(scriptName) {
  delete scripts[scriptName];
}

function clear() {
  console.clear();
}

function shutdown() {
  process.stdout.write('\u001B[?1049l\x1B[?25h'); // show cursor and exit alternative buffer - incase

  process.exit();
}

module.exports = {
  runScriptName,
  runScript,

  scriptor,
  generateContext,

  addScript,

  native: {
    clear,
    shutdown
  }
};