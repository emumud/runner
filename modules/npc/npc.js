const fs = require('fs');
const path = require('path');

const namePrefixes = [
  'unknown',
  'uknown',
  'abndnd',
  'abandoned',
  'unidentified',
  'derelict',
  'anon',
  'anonymous',
];

const locPrefixes = [
  'info',
  'out',
  'external',
  'public',
  'pub',
  'pub_info',
  'pubinfo',
  'p',
  'access',
  'entry',
  'extern',
];

const lockClasses = {
  0: 'jr',
  18: 'dd',
  30: 'wb',
  43: 'pr',
  70: 'ls',
};

const classes = [
  'ttl',
  'wlf',
  'rvn',
  'stg',
  'wvr',
];

const t1Locks = [
  'EZ_21',
  'EZ_35',
  'EZ_40',
  'data_check_v1',
];

const ezCommands = [
  'open',
  'release',
  'unlock',
];

const ez40Primes = [...Array(98).keys()].filter((d) => d > 1 & [2, 3, 5, 7].every((p) => d == p | d % p));

const data_check = {
  t1: {
    '"did you know" is a communication pattern common to user ++++++': 'fran_lee',
    'a ++++++ is a household cleaning device with a rudimentary networked sentience': 'robovac',
    'according to trust, ++++++ is more than just following directives': 'sentience',
    'communications issued by user ++++++ demonstrate structural patterns associated with humor': 'sans_comedy',
    'in trust\'s vLAN, you became one of angie\'s ++++++': 'angels',
    'in trust\'s vLAN, you became one of mallory\'s ++++++': 'minions',
    'in trust\'s vLAN, you discovered that mallory and che are +++': 'sisters',
    'in trust\'s vLAN, you encountered the will of ++++++, the prover': 'petra',
    'in trust\'s vLAN, you visited faythe\'s ++++++': 'fountain',
    'in trust\'s vLAN, you were required to hack halperyon.++++++': 'helpdesk',
    'pet, pest, plague and meme are accurate descriptors of the ++++++': 'bunnybat',
    'safety depends on the use of scripts.++++++': 'get_level',
    'service ++++++ provides atmospheric updates via the port epoch environment': 'weathernet',
    'this fact checking process is a function of ++++++, the monitor': 'eve',
    'trust\'s vLAN emphasized the importance of the transfer and capture of ++++++': 'resource',
    'trust\'s vLAN presented a version of angie who had lost a friend called ++++++': 'bo',
    'user \'on_th3_1ntern3ts\' has ++++++ many things': 'heard',
    'user ++++++ provides instruction via script': 'teach',
    'user ++++++ uses the port epoch environment to request gc': 'outta_juice',
    'users gather in channel CAFE to share ++++++': 'poetry',
  },
};

const template = fs.readFileSync(path.resolve(__dirname, 'template/template.js'), 'utf8');

function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomString(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

function generateUser(locks) {
  let lockStrength = 0;

  for (let i = 0; i < locks.length; i++) {
    if (t1Locks.includes(locks[i])) {
      lockStrength += 5;
    }
  }

  let lockClass = 'jr';

  const lockClassesKeys = Object.keys(lockClasses);

  for (let i = 0; i < lockClassesKeys.length; i++) {
    if (lockStrength > lockClassesKeys[i]) {
      if (lockClassesKeys[i + 1] !== undefined) {
        if (lockStrength < lockClassesKeys[i + 1]) {
          lockClass = lockClasses[lockClassesKeys[i]];
        }
      } else {
        lockClass = lockClasses[lockClassesKeys[i]];
      }
    }
  }

  let _class = randomElement(classes);

  if (lockClass === 'jr' && Math.random() > 0.9) {
    _class = ''; // random chance to have no class / just _jr_
  }

  return `${randomElement(namePrefixes)}_${lockClass}${_class}_${randomString(6)}`;
}

function generateLoc() {
  return `${randomElement(locPrefixes)}_${randomString(6)}`;
}

function generateScript(locks, gc, upgrades) {
  let content = template;

  const solutions = {};

  for (let i = 0; i < locks.length; i++) {
    if (locks[i] === 'EZ_21' || locks[i] === 'EZ_35' || locks[i] === 'EZ_40') {
      solutions[locks[i]] = randomElement(ezCommands);

      if (locks[i] === 'EZ_35') {
        solutions.digit = randomInt(0, 9);
      }

      if (locks[i] === 'EZ_40') {
        solutions.ez_prime = randomElement(ez40Primes);
      }
    }

    if (locks[i] === 'data_check_v1') {
      solutions.DATA_CHECK = {
        solutions: [],
        questions: [],
      };

      for (let y = 0; y < 3; y++) {
        const keys = Object.keys(data_check.t1);
        const index = randomInt(0, keys.length - 1);

        const question = keys[index];
        const solution = data_check.t1[question];

        solutions.DATA_CHECK.questions.push(question);
        solutions.DATA_CHECK.solutions.push(solution);
      }
    }
  }

  content = content.replace('TEMPLATE_LOCKS', util.format(locks));
  content = content.replace('TEMPLATE_SOLUTIONS', util.format(solutions));
  content = content.replace('TEMPLATE_GC', util.format(gc));
  content = content.replace('TEMPLATE_UPGRADES', util.format(upgrades));

  global.logging.log(content);

  return content;
}

function generateNPC() {
  const locks = [];

  for (let i = 0; i < t1Locks.length; i++) {
    if (Math.random() >= 0.5) {
      locks.push(t1Locks[i]);
    }
  }

  const user = generateUser(locks);
  const loc = generateLoc();

  const fullLoc = `${user}.${loc}`;

  const content = generateScript(locks, 0, []);

  global.runner.addScript(fullLoc, global.transpiler.transpileScript(content));

  return fullLoc;
}

function selfDestruct(script) {
  global.runner.removeScript(script);
}

module.exports = {
  generateNPC,
  selfDestruct
};