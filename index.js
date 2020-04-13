const vm = require('vm');

// runner internal modules
const hardline = require('./modules/hardline.js');
const chat = require('./modules/chat.js');
const npc = require('./modules/npc/npc.js');

// emumud modules
const logging = require('logging');
const transpiler = require('transpiler');

global.scripts = require('scripts').loadScripts();

global.transpiler = transpiler;
global.hardline = hardline;
global.chat = chat;
global.logging = logging;
global.runner = module.exports;

global.user = 'default';
global.users = [];
global.mode = 'hackmud';

function generateContext(script, user = 'default') {
  return {
    'caller': user,
    'calling_script': null,
    'this_script': script,
    cols: process.stdout.columns,
    rows: process.stdout.rows
  };
}

function runScriptName(name, context, args) {
  return runScript(global.scripts[name].transpiled, name, context, args);
}

function runScriptFile(filepath, scriptName, context, args) {
  const origContent = fs.readFileSync(filepath);
  
  return runScript(origContent, scriptName, context, args);  
}

function runScript(content, scriptName, context, args) {
  context = context === undefined || generateContext(scriptName); // not given context at all
  context = typeof context === 'string' || generateContext(scriptName, context); // given user as context

  const sandbox = {
    emumudInternals: {
      transpiler,
      runner: module.exports,

      logging,
      
      chat,
      npc,
      hardline
    },
  
    emumud_args: args,
    emumud_context: context,
  
    require: undefined,
    console: undefined
  };

  global.running_context = context;
  global.running_args = args;

  if (!content.includes('transpiled with emumud transpiler')) {
    content = transpiler.transpileScript(content).transpiled;
  }

  try {
    return vm.runInNewContext(content, sandbox, { timeout: 5000, contextCodeGeneration: { strings: false, wasm: false } });
  } catch (err) {
    if (err.code === 'ERR_SCRIPT_EXECUTION_TIMEOUT') {
      return [false, ':::TRUST COMMUNICATION::: The script ran for more than 5000 milliseconds and was terminated.'];
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
  global.scripts[scriptName] = scriptInfo;
}

function removeScript(scriptName) {
  delete global.scripts[scriptName];
}

function clear() {
  console.clear();
}

function shutdown() {
  process.stdout.write('\u001B[?1049l\x1B[?25h'); // show cursor and exit alternative buffer - incase

  process.exit();
}

function changeUser(newUser) {
  global.user = newUser;
}

module.exports = {
  runScriptName,
  runScript,
  runScriptFile,

  scriptor,
  generateContext,

  addScript,
  removeScript,

  native: {
    clear,
    shutdown,
    changeUser
  }
};