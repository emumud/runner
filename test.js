const runner = require('./index.js');

let o = runner.runScriptName('trust.me');
console.log('trust.me:', o, 'expected:', o === 'thank you');