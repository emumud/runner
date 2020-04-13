const bigChars = {
  '0': '  ___  \n / _ \\ \n| | | |\n| | | |\n| |_| |\n \\___/ \n',
  '1': ' __ \n/_ |\n | |\n | |\n | |\n |_|\n    \n    ',
  '2': ' ___  \n|__ \\ \n   ) |\n  / / \n / /_ \n|____|\n',
  '3': ' ____  \n|___ \\ \n  __) |\n |__ < \n ___) |\n|____/ \n',
  '4': ' _  _   \n| || |  \n| || |_ \n|__   _|\n   | |  \n   |_|  \n',
  '5': ' _____ \n| ____|\n| |__  \n|___ \\ \n ___) |\n|____/ \n',
  '6': '   __  \n  / /  \n / /_  \n| \'_ \\ \n| (_) |\n \\___/ \n',
  '7': ' ______ \n|____  |\n    / / \n   / /  \n  / /   \n /_/    \n',
  '8': '  ___  \n / _ \\ \n| (_) |\n > _ < \n| (_) |\n \\___/ \n',
  '9': '  ___  \n / _ \\ \n| (_) |\n \\__, |\n   / / \n  /_/  \n',
  '.': '\n\n\n\n _ \n(_) \n'
};

let _status = false;
let _time = 0;
let timerRunning = false;
let _showTimer = true;
let _lastTimeString = '';

function showTimer() {
  const timeString = _time.toFixed(2).toString();
  const offset = Math.floor(timeString.length * 7) + 2;

  process.stdout.write('\033[s\x1B[?25l'); // save cursor position and hide it

  if (timeString.length !== _lastTimeString.length) {
    for (let i = 1; i < 8; i++) {
      process.stdout.write('\033[' + i + ';' + (process.stdout.columns - (offset + 7)) + 'H');
      process.stdout.write(' '.repeat(7));
    }
  }

  for (let i = 0; i < timeString.length; i++) {
    const char = bigChars[timeString[i]].split('\n');

    for (let y = 0; y < char.length; y++) {
      let spacing = timeString[i - 1] === '.' || timeString[i - 2] === '.' ? 7 : 8;
      spacing = i === 0 && timeString.length === 6 ? 5 : spacing;

      if (timeString[i] !== '.') {
        process.stdout.write('\033[' + (y + 1) + ';' + Math.floor(process.stdout.columns - ((offset - i * spacing) - 5) - 5) + 'H');
        process.stdout.write(' '.repeat(spacing));
      }

      process.stdout.write('\033[' + (y + 1) + ';' + Math.floor(process.stdout.columns - (offset - (i * spacing))) + 'H');
      process.stdout.write(global.logging.parse(char[y]));
    }
  }

  process.stdout.write('\033[u\x1B[?25h'); // restore cursor position and show it

  _lastTimeString = timeString;
}

function runTimer() {
  if (_time <= 0) {
    off();
    return;
  }

  const startTime = new Date();

  if (_showTimer === true) {
    showTimer();
  }

  if (timerRunning) {
    _time -= 0.01;

    let duration = new Date() - startTime;
    duration = duration < 0 ? 0 : duration;

    setTimeout(runTimer, 10 - duration);
  }
}

function showDoors(current, max, stage) {
  const previous = stage === 1 ? 1 : -1;

  const rows = process.stdout.rows + 1;

  process.stdout.write('\x1B[?25l'); // hide cursor

  for (let i = 0; i < rows; i++) {
    let leftPos = current;
    let rightPos = process.stdout.columns - current;

    if (i % 2 === 0) {
      leftPos++;
      rightPos++;
    }

    process.stdout.write('\033[' + i + ';' + (rightPos + previous) + 'H');
    process.stdout.write(' ');

    process.stdout.write('\033[' + i + ';' + (leftPos - previous) + 'H');
    process.stdout.write(' ');

    process.stdout.write('\033[' + i + ';' + (rightPos) + 'H');
    process.stdout.write(global.logging.hackmudColor('D', '█', true));

    process.stdout.write('\033[' + i + ';' + (leftPos) + 'H');
    process.stdout.write(global.logging.hackmudColor('D', '█', true));
  }

  process.stdout.write('\033[0;0H'); // set cursor position to 0,0

  if (current === max) {
    doorsComplete(stage);
  }
}

function hardlineDoorsStage2() {
  const amount = Math.round(process.stdout.columns / 2);

  for (let i = 1; i < amount; i++) {
    setTimeout(function() { showDoors((amount - i), 1, 2); }, i * 10);
  }
}

function doorsComplete(stage) {
  if (stage === 1) {
    if (_status === false) {
      _status = true;
      _time = 120;
    } else {
      _status = false;
      _time = 0;
    }

    setTimeout(hardlineDoorsStage2, 200);
  } else {
    console.clear();
    process.stdout.write('\u001B[?1049l\x1B[?25h'); // exit alternative buffer, show cursor

    if (_status === true) {
      global.logging.log('`0-activating hardline-`\n\n\n`D-hardline active-`');

      timerRunning = true;
      runTimer();

      showTimer();

      // timerInterval = setInterval(function() { runTimer(); _time -= 0.01; }, 10);
    } else {
      global.logging.log('\n`0-hardline disconnected-`');
    }

    process.stdout.write('\n:');
  }
}

function hardlineDoors() {
  process.stdout.write('\u001B[?1049h\x1B[?25l'); // enter alternative buffer, hide cursor

  if (_status === true) {
    const timeString = _time.toFixed(2).toString();

    const offset = Math.floor(timeString.length * 6.5) + 2;

    for (let i = 1; i < 10; i++) {
      process.stdout.write('\033[' + i + ';' + (process.stdout.columns - (offset + 7)) + 'H');
      process.stdout.write(' '.repeat(offset + 7));
    }
  }

  const amount = Math.round(process.stdout.columns / 2);

  for (let i = 1; i < amount; i++) {
    setTimeout(function() { showDoors(i, amount - 1, 1); }, i * 10);
  }
}

function on() {
  if (_status === false) {
    hardlineDoors();

    return true;
  } else {
    return false;
  }
}

function off() {
  if (_status === true) {
    timerRunning = false;

    hardlineDoors();

    return true;
  } else {
    return false;
  }
}

function status() {
  return _status;
}

function time() {
  return _time;
}

module.exports = {
  bigChars,
  status,
  time,
  showTimer,

  on,
  off
};